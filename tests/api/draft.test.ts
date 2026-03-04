import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSet = vi.fn().mockResolvedValue(undefined);
const mockDelete = vi.fn().mockResolvedValue(undefined);
const mockGet = vi.fn().mockResolvedValue({ exists: false, data: () => null });

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
    collection: vi.fn().mockReturnValue({
      doc: vi.fn().mockReturnValue({
        get: mockGet,
        set: mockSet,
        delete: mockDelete,
      }),
    }),
  }),
  getAdminAuth: () => ({ verifyIdToken: vi.fn() }),
}));

import { GET, PUT, DELETE } from '@/app/api/interview/draft/route';
import { verifyAuth } from '@/lib/auth-middleware';

function makeGetRequest(): NextRequest {
  return new NextRequest('http://localhost:3000/api/interview/draft', {
    headers: { Authorization: 'Bearer token' },
  });
}

function makePutRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/interview/draft', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
    body: JSON.stringify(body),
  });
}

function makeDeleteRequest(): NextRequest {
  return new NextRequest('http://localhost:3000/api/interview/draft', {
    method: 'DELETE',
    headers: { Authorization: 'Bearer token' },
  });
}

const validDraft = {
  jobDescription: 'Software Engineer at Acme Corp',
  researchData: { companyContext: '', roleContext: '', suggestedQuestions: [] },
  questions: [{ text: 'Tell me about yourself', type: 'behavioral', id: 'q1' }],
  currentQuestionIndex: 0,
  history: [],
  sessionStartTimestamp: Date.now(),
  followUpsOffered: 0,
  followUpsTaken: 0,
};

describe('/api/interview/draft', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('GET', () => {
    it('returns null when no draft exists', async () => {
      mockGet.mockResolvedValueOnce({ exists: false, data: () => null });
      const response = await GET(makeGetRequest());
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.draft).toBeNull();
    });

    it('returns draft when it exists', async () => {
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({ ...validDraft, updatedAt: '2025-01-01T00:00:00Z' }),
      });
      const response = await GET(makeGetRequest());
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.draft.jobDescription).toBe('Software Engineer at Acme Corp');
    });

    it('requires auth', async () => {
      const { AuthError } = await import('@/lib/auth-middleware');
      vi.mocked(verifyAuth).mockRejectedValueOnce(new AuthError('Unauthorized', 401));
      const response = await GET(makeGetRequest());
      expect(response.status).toBe(401);
    });
  });

  describe('PUT', () => {
    it('saves a draft', async () => {
      const response = await PUT(makePutRequest(validDraft));
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(mockSet).toHaveBeenCalledOnce();
    });

    it('returns 400 without jobDescription', async () => {
      const response = await PUT(makePutRequest({ history: [], questions: [] }));
      const body = await response.json();
      expect(response.status).toBe(400);
      expect(body.error).toContain('jobDescription');
    });

    it('returns 400 without history array', async () => {
      const response = await PUT(makePutRequest({ jobDescription: 'test', questions: [], history: 'bad' }));
      const body = await response.json();
      expect(response.status).toBe(400);
      expect(body.error).toContain('history');
    });

    it('returns 400 without questions array', async () => {
      const response = await PUT(makePutRequest({ jobDescription: 'test', history: [] }));
      const body = await response.json();
      expect(response.status).toBe(400);
      expect(body.error).toContain('questions');
    });

    it('requires auth', async () => {
      const { AuthError } = await import('@/lib/auth-middleware');
      vi.mocked(verifyAuth).mockRejectedValueOnce(new AuthError('Unauthorized', 401));
      const response = await PUT(makePutRequest(validDraft));
      expect(response.status).toBe(401);
    });
  });

  describe('DELETE', () => {
    it('deletes a draft', async () => {
      const response = await DELETE(makeDeleteRequest());
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(mockDelete).toHaveBeenCalledOnce();
    });

    it('requires auth', async () => {
      const { AuthError } = await import('@/lib/auth-middleware');
      vi.mocked(verifyAuth).mockRejectedValueOnce(new AuthError('Unauthorized', 401));
      const response = await DELETE(makeDeleteRequest());
      expect(response.status).toBe(401);
    });
  });
});
