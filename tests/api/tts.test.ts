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
  generateSpeech: vi.fn().mockResolvedValue({ audioBase64: 'audio-data', sampleRate: 24000 }),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true, retryAfter: 0 }),
}));

import { POST } from '@/app/api/interview/tts/route';
import { checkRateLimit } from '@/lib/rate-limit';

function makeRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/interview/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/interview/tts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns audio data', async () => {
    const response = await POST(makeRequest({ text: 'Hello' }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.audioBase64).toBe('audio-data');
    expect(body.sampleRate).toBe(24000);
  });

  it('returns 400 without text', async () => {
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(400);
  });

  it('returns 400 when text is not a string', async () => {
    const response = await POST(makeRequest({ text: 42 }));
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toContain('text');
  });

  it('returns 400 when text exceeds max length', async () => {
    const response = await POST(makeRequest({ text: 'x'.repeat(5001) }));
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toContain('5000');
  });

  it('returns 429 when rate limited', async () => {
    vi.mocked(checkRateLimit).mockReturnValueOnce({ allowed: false, retryAfter: 10 });
    const response = await POST(makeRequest({ text: 'Hello' }));
    const body = await response.json();
    expect(response.status).toBe(429);
    expect(body.error).toContain('10 seconds');
  });
});
