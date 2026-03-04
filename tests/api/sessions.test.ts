import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth-middleware', () => ({
  verifyAuth: vi.fn().mockResolvedValue({ uid: 'user-123' }),
  handleAuthError: vi.fn().mockImplementation((e: any) => {
    const { NextResponse } = require('next/server');
    return NextResponse.json({ error: e.message }, { status: e.status || 500 });
  }),
  AuthError: class extends Error { status: number; constructor(m: string, s: number) { super(m); this.status = s; } },
}));

vi.mock('@/lib/firebase-admin', () => {
  const mockAdd = vi.fn().mockResolvedValue({ id: 'session-1' });
  const mockGet = vi.fn().mockResolvedValue({
    docs: [
      { id: 'session-1', data: () => ({ userId: 'user-123', profile: {}, history: [], overallScore: 8 }) },
    ],
  });
  const mockOrderBy = vi.fn().mockReturnValue({ get: mockGet });
  const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
  const mockDelete = vi.fn().mockResolvedValue(undefined);
  const mockDoc = vi.fn().mockReturnValue({ delete: mockDelete });

  return {
    getAdminDb: () => ({
      collection: vi.fn().mockReturnValue({
        add: mockAdd,
        where: mockWhere,
        doc: mockDoc,
      }),
    }),
    getAdminAuth: () => ({ verifyIdToken: vi.fn() }),
  };
});

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true, retryAfter: 0 }),
}));

import { GET, POST } from '@/app/api/sessions/route';
import { checkRateLimit } from '@/lib/rate-limit';

function makeGetRequest(): NextRequest {
  return new NextRequest('http://localhost:3000/api/sessions', {
    headers: { Authorization: 'Bearer token' },
  });
}

function makePostRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
    body: JSON.stringify(body),
  });
}

describe('/api/sessions', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('GET', () => {
    it('returns sessions for the user', async () => {
      const response = await GET(makeGetRequest());
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.sessions).toHaveLength(1);
    });

    it('returns 429 when rate limited', async () => {
      vi.mocked(checkRateLimit).mockReturnValueOnce({ allowed: false, retryAfter: 20 });
      const response = await GET(makeGetRequest());
      const body = await response.json();
      expect(response.status).toBe(429);
      expect(body.error).toContain('20 seconds');
    });
  });

  describe('POST', () => {
    it('creates a session', async () => {
      const response = await POST(
        makePostRequest({
          profile: { role: 'SWE', company: 'Google' },
          history: [],
          overallScore: 8,
        }),
      );
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.id).toBe('session-1');
    });

    it('returns 400 without profile', async () => {
      const response = await POST(makePostRequest({ history: [] }));
      expect(response.status).toBe(400);
    });

    it('returns 400 when history is not an array', async () => {
      const response = await POST(makePostRequest({ profile: { role: 'SWE' }, history: 'bad' }));
      const body = await response.json();
      expect(response.status).toBe(400);
      expect(body.error).toContain('history');
    });

    it('returns 429 when rate limited', async () => {
      vi.mocked(checkRateLimit).mockReturnValueOnce({ allowed: false, retryAfter: 5 });
      const response = await POST(
        makePostRequest({ profile: { role: 'SWE' }, history: [] }),
      );
      const body = await response.json();
      expect(response.status).toBe(429);
      expect(body.error).toContain('5 seconds');
    });
  });
});
