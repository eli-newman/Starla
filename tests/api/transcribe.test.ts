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

import { POST } from '@/app/api/interview/transcribe/route';

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
});
