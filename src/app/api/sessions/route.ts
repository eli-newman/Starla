import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';
import { checkRateLimit } from '@/lib/rate-limit';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { uid } = await verifyAuth(request);

    const rateLimitResult = checkRateLimit(uid, 'sessions');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds.` },
        { status: 429 },
      );
    }

    const snapshot = await getAdminDb()
      .collection('interviews')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();

    const sessions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ sessions });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { uid } = await verifyAuth(request);

    const rateLimitResult = checkRateLimit(uid, 'sessions');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds.` },
        { status: 429 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    const { profile, history, overallScore } = body as Record<string, unknown>;

    if (!profile || typeof profile !== 'object') {
      return NextResponse.json({ error: 'profile is required and must be an object' }, { status: 400 });
    }
    if (!Array.isArray(history)) {
      return NextResponse.json({ error: 'history is required and must be an array' }, { status: 400 });
    }
    if (history.length > 100) {
      return NextResponse.json({ error: 'history must have at most 100 entries' }, { status: 400 });
    }

    const docRef = await getAdminDb().collection('interviews').add({
      userId: uid,
      profile,
      history,
      overallScore: typeof overallScore === 'number' ? overallScore : 0,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    return handleAuthError(error);
  }
}
