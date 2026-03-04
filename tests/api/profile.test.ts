import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockGet = vi.hoisted(() => vi.fn());
const mockSet = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth-middleware', () => ({
  verifyAuth: vi.fn().mockResolvedValue({ uid: 'user-123' }),
  handleAuthError: vi.fn().mockImplementation((e: any) => {
    const { NextResponse } = require('next/server');
    return NextResponse.json({ error: e.message }, { status: e.status || 500 });
  }),
  AuthError: class extends Error { status: number; constructor(m: string, s: number) { super(m); this.status = s; } },
}));

vi.mock('@/lib/firebase-admin', () => ({
  getAdminDb: () => ({
    collection: () => ({
      doc: () => ({
        get: mockGet,
        set: mockSet.mockResolvedValue(undefined),
      }),
    }),
  }),
  getAdminAuth: () => ({ verifyIdToken: vi.fn() }),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true, retryAfter: 0 }),
}));

import { GET, PUT } from '@/app/api/profile/route';

function makeGetRequest(): NextRequest {
  return new NextRequest('http://localhost:3000/api/profile', {
    headers: { Authorization: 'Bearer token' },
  });
}

function makePutRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
    body: JSON.stringify(body),
  });
}

describe('/api/profile', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('GET', () => {
    it('returns null for new user', async () => {
      mockGet.mockResolvedValue({ exists: false });
      const response = await GET(makeGetRequest());
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.profile).toBeNull();
    });

    it('returns profile for existing user', async () => {
      const profileData = { experience: 'Senior', resume: 'My resume', createdAt: '2025-01-01', updatedAt: '2025-01-01' };
      mockGet.mockResolvedValue({ exists: true, data: () => profileData });
      const response = await GET(makeGetRequest());
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.profile.experience).toBe('Senior');
    });
  });

  describe('PUT', () => {
    it('creates a profile', async () => {
      mockGet.mockResolvedValue({ exists: false, data: () => ({ experience: 'Senior', resume: '', updatedAt: '2025-01-01', createdAt: '2025-01-01' }) });
      const response = await PUT(makePutRequest({ experience: 'Senior', resume: 'My resume' }));
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.profile).toBeDefined();
      expect(mockSet).toHaveBeenCalled();
    });

    it('validates experience field', async () => {
      const response = await PUT(makePutRequest({ experience: 'Invalid Level' }));
      const body = await response.json();
      expect(response.status).toBe(400);
      expect(body.error).toContain('experience');
    });

    it('returns 400 without experience', async () => {
      const response = await PUT(makePutRequest({ resume: 'My resume' }));
      expect(response.status).toBe(400);
    });

    it('returns 400 when resume exceeds max length', async () => {
      const response = await PUT(makePutRequest({ experience: 'Senior', resume: 'x'.repeat(10001) }));
      const body = await response.json();
      expect(response.status).toBe(400);
      expect(body.error).toContain('resume');
    });
  });
});
