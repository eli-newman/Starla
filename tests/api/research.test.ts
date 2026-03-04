import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth-middleware', () => ({
  verifyAuth: vi.fn().mockResolvedValue({ uid: 'user-123' }),
  handleAuthError: vi.fn().mockImplementation((e: any) => {
    const { NextResponse } = require('next/server');
    return NextResponse.json({ error: e.message }, { status: e.status || 500 });
  }),
  AuthError: class AuthError extends Error {
    status: number;
    constructor(msg: string, status: number) { super(msg); this.status = status; }
  },
}));

vi.mock('@/lib/gemini', () => ({
  researchJob: vi.fn().mockResolvedValue({
    companyContext: 'Great company',
    roleContext: 'Needs skills',
    suggestedQuestions: ['Q1'],
    sources: [],
  }),
}));

vi.mock('@/lib/firebase-admin', () => {
  const mockCacheGet = vi.fn().mockResolvedValue({ exists: false });
  const mockCacheSet = vi.fn().mockResolvedValue(undefined);
  return {
    getAdminDb: () => ({
      collection: () => ({
        doc: () => ({
          get: mockCacheGet,
          set: mockCacheSet,
        }),
      }),
    }),
    getAdminAuth: () => ({ verifyIdToken: vi.fn() }),
  };
});

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true, retryAfter: 0 }),
}));

import { POST } from '@/app/api/interview/research/route';
import { checkRateLimit } from '@/lib/rate-limit';

function makeRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/interview/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/interview/research', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns research data', async () => {
    const response = await POST(makeRequest({ jobDescription: 'Senior SWE at Google...', resume: '', experience: 'Senior' }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.companyContext).toBe('Great company');
  });

  it('returns 400 without jobDescription', async () => {
    const response = await POST(makeRequest({ resume: 'my resume' }));
    expect(response.status).toBe(400);
  });

  it('returns 400 when jobDescription is not a string', async () => {
    const response = await POST(makeRequest({ jobDescription: 123 }));
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toContain('jobDescription');
  });

  it('returns 400 when jobDescription exceeds max length', async () => {
    const response = await POST(makeRequest({ jobDescription: 'x'.repeat(10001) }));
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toContain('10000');
  });

  it('returns 400 when resume exceeds max length', async () => {
    const response = await POST(makeRequest({ jobDescription: 'SWE at Google', resume: 'x'.repeat(10001) }));
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toContain('resume');
  });

  it('returns 429 when rate limited', async () => {
    vi.mocked(checkRateLimit).mockReturnValueOnce({ allowed: false, retryAfter: 42 });
    const response = await POST(makeRequest({ jobDescription: 'SWE at Google' }));
    const body = await response.json();
    expect(response.status).toBe(429);
    expect(body.error).toContain('42 seconds');
  });
});
