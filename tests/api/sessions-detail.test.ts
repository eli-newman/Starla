import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockDocGet = vi.hoisted(() => vi.fn());

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
        get: mockDocGet,
      }),
    }),
  }),
  getAdminAuth: () => ({ verifyIdToken: vi.fn() }),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true, retryAfter: 0 }),
}));

import { GET } from '@/app/api/sessions/[id]/route';

function makeRequest(id: string): NextRequest {
  return new NextRequest(`http://localhost:3000/api/sessions/${id}`, {
    headers: { Authorization: 'Bearer token' },
  });
}

describe('GET /api/sessions/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns session data', async () => {
    const sessionData = { userId: 'user-123', profile: {}, history: [], overallScore: 8, createdAt: '2025-01-01' };
    mockDocGet.mockResolvedValue({ exists: true, id: 'session-1', data: () => sessionData });
    const response = await GET(makeRequest('session-1'), { params: { id: 'session-1' } });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.session.overallScore).toBe(8);
  });

  it('returns 404 for missing session', async () => {
    mockDocGet.mockResolvedValue({ exists: false });
    const response = await GET(makeRequest('nonexistent'), { params: { id: 'nonexistent' } });
    const body = await response.json();
    expect(response.status).toBe(404);
    expect(body.error).toContain('not found');
  });

  it('returns 403 for unauthorized access', async () => {
    const sessionData = { userId: 'other-user', profile: {}, history: [], overallScore: 5 };
    mockDocGet.mockResolvedValue({ exists: true, id: 'session-1', data: () => sessionData });
    const response = await GET(makeRequest('session-1'), { params: { id: 'session-1' } });
    const body = await response.json();
    expect(response.status).toBe(403);
    expect(body.error).toContain('Forbidden');
  });
});
