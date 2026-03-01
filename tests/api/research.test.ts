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
  researchRole: vi.fn().mockResolvedValue({
    companyContext: 'Great company',
    roleContext: 'Needs skills',
    suggestedQuestions: ['Q1'],
    sources: [],
  }),
}));

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
    const response = await POST(makeRequest({ role: 'SWE', company: 'Google', resume: '', focusAreas: '' }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.companyContext).toBe('Great company');
  });

  it('returns 400 without role', async () => {
    const response = await POST(makeRequest({ company: 'Google' }));
    expect(response.status).toBe(400);
  });

  it('returns 400 when role is not a string', async () => {
    const response = await POST(makeRequest({ role: 123, company: 'Google' }));
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toContain('role');
  });

  it('returns 400 when role exceeds max length', async () => {
    const response = await POST(makeRequest({ role: 'x'.repeat(201), company: 'Google' }));
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toContain('200');
  });

  it('returns 400 when resume exceeds max length', async () => {
    const response = await POST(makeRequest({ role: 'SWE', company: 'Google', resume: 'x'.repeat(10001) }));
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toContain('resume');
  });

  it('returns 429 when rate limited', async () => {
    vi.mocked(checkRateLimit).mockReturnValueOnce({ allowed: false, retryAfter: 42 });
    const response = await POST(makeRequest({ role: 'SWE', company: 'Google' }));
    const body = await response.json();
    expect(response.status).toBe(429);
    expect(body.error).toContain('42 seconds');
  });
});
