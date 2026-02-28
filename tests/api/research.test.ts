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

import { POST } from '@/app/api/interview/research/route';

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
});
