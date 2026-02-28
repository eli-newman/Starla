import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyAuth, AuthError, handleAuthError } from '@/lib/auth-middleware';

// Mock firebase-admin
const mockVerifyIdToken = vi.fn();
vi.mock('@/lib/firebase-admin', () => ({
  getAdminAuth: () => ({
    verifyIdToken: mockVerifyIdToken,
  }),
  getAdminDb: () => ({}),
}));

function makeRequest(token?: string): NextRequest {
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return new NextRequest('http://localhost:3000/api/test', { headers });
}

describe('verifyAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws AuthError when no Authorization header', async () => {
    const req = makeRequest();
    await expect(verifyAuth(req)).rejects.toThrow(AuthError);
    await expect(verifyAuth(req)).rejects.toThrow('Missing or invalid Authorization header');
  });

  it('throws AuthError when token is invalid', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));
    const req = makeRequest('bad-token');
    await expect(verifyAuth(req)).rejects.toThrow(AuthError);
    await expect(verifyAuth(req)).rejects.toThrow('Invalid or expired token');
  });

  it('returns uid when token is valid', async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: 'user-123' } as any);
    const req = makeRequest('valid-token');
    const result = await verifyAuth(req);
    expect(result).toEqual({ uid: 'user-123' });
    expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token');
  });
});

describe('handleAuthError', () => {
  it('returns proper response for AuthError', async () => {
    const error = new AuthError('Unauthorized', 401);
    const response = handleAuthError(error);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 500 for unknown errors', async () => {
    const response = handleAuthError(new Error('random'));
    expect(response.status).toBe(500);
  });
});
