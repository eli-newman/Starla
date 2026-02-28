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
  evaluateAnswer: vi.fn().mockResolvedValue({
    strengths: ['Good'],
    improvements: ['Add more'],
    betterAnswer: 'Better...',
    score: 7,
  }),
}));

import { POST } from '@/app/api/interview/evaluate/route';

function makeRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/interview/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/interview/evaluate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns feedback', async () => {
    const response = await POST(makeRequest({ question: 'Q?', answer: 'My answer', context: {} }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.score).toBe(7);
  });

  it('returns 400 without question', async () => {
    const response = await POST(makeRequest({ answer: 'A' }));
    expect(response.status).toBe(400);
  });
});
