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

vi.mock('@/lib/gemini', () => ({
  generateQuestion: vi.fn().mockResolvedValue({ text: 'Describe a challenge', type: 'behavioral' }),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true, retryAfter: 0 }),
}));

import { POST } from '@/app/api/interview/question/route';
import { checkRateLimit } from '@/lib/rate-limit';

function makeRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/interview/question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/interview/question', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns a question', async () => {
    const response = await POST(makeRequest({ history: [], researchData: { companyContext: '', roleContext: '' } }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.text).toBe('Describe a challenge');
  });

  it('returns 400 without researchData', async () => {
    const response = await POST(makeRequest({ history: [] }));
    expect(response.status).toBe(400);
  });

  it('returns 400 when history is not an array', async () => {
    const response = await POST(makeRequest({ history: 'bad', researchData: {} }));
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toContain('history');
  });

  it('returns 429 when rate limited', async () => {
    vi.mocked(checkRateLimit).mockReturnValueOnce({ allowed: false, retryAfter: 30 });
    const response = await POST(makeRequest({ history: [], researchData: {} }));
    const body = await response.json();
    expect(response.status).toBe(429);
    expect(body.error).toContain('30 seconds');
  });
});
