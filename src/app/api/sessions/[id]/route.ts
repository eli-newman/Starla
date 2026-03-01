import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';
import { checkRateLimit } from '@/lib/rate-limit';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { uid } = await verifyAuth(request);

    const rateLimitResult = checkRateLimit(uid, 'sessions');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds.` },
        { status: 429 },
      );
    }

    const doc = await getAdminDb().collection('interviews').doc(params.id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const data = doc.data()!;
    if (data.userId !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ session: { id: doc.id, ...data } });
  } catch (error) {
    return handleAuthError(error);
  }
}
