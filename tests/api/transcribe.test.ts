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
  transcribeAudio: vi.fn().mockResolvedValue('Hello world'),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true, retryAfter: 0 }),
}));

import { POST } from '@/app/api/interview/transcribe/route';
import { checkRateLimit } from '@/lib/rate-limit';

function makeRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/interview/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/interview/transcribe', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns transcribed text', async () => {
    const response = await POST(makeRequest({ audioBase64: 'data', mimeType: 'audio/webm' }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.text).toBe('Hello world');
  });

  it('returns 400 without audioBase64', async () => {
    const response = await POST(makeRequest({ mimeType: 'audio/webm' }));
    expect(response.status).toBe(400);
  });

  it('returns 400 when audioBase64 is not a string', async () => {
    const response = await POST(makeRequest({ audioBase64: 123, mimeType: 'audio/webm' }));
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toContain('audioBase64');
  });

  it('returns 400 without mimeType', async () => {
    const response = await POST(makeRequest({ audioBase64: 'data' }));
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toContain('mimeType');
  });

  it('returns 429 when rate limited', async () => {
    vi.mocked(checkRateLimit).mockReturnValueOnce({ allowed: false, retryAfter: 55 });
    const response = await POST(makeRequest({ audioBase64: 'data', mimeType: 'audio/webm' }));
    const body = await response.json();
    expect(response.status).toBe(429);
    expect(body.error).toContain('55 seconds');
  });
});
