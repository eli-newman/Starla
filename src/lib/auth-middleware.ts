import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from './firebase-admin';

export interface AuthenticatedRequest {
  uid: string;
}

export async function verifyAuth(request: NextRequest): Promise<AuthenticatedRequest> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Missing or invalid Authorization header', 401);
  }

  const token = authHeader.slice(7);
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return { uid: decoded.uid };
  } catch {
    throw new AuthError('Invalid or expired token', 401);
  }
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
