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

    let sessions: Record<string, unknown>[] = [];
    try {
      const snapshot = await getAdminDb()
        .collection('interviews')
        .where('userId', '==', uid)
        .orderBy('createdAt', 'desc')
        .get();
      sessions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch {
      // Composite index may not exist — fall back to unordered query
      try {
        const snapshot = await getAdminDb()
          .collection('interviews')
          .where('userId', '==', uid)
          .get();
        sessions = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const dateA = typeof (a as Record<string, unknown>).createdAt === 'string' ? new Date((a as Record<string, unknown>).createdAt as string).getTime() : 0;
            const dateB = typeof (b as Record<string, unknown>).createdAt === 'string' ? new Date((b as Record<string, unknown>).createdAt as string).getTime() : 0;
            return dateB - dateA;
          });
      } catch (firestoreError: unknown) {
        console.error('Firestore query error (sessions):', firestoreError);
      }
    }
    return NextResponse.json({ sessions });
  } catch (error) {
    return handleAuthError(error);
  }
}

const FREE_MONTHLY_LIMIT = 3;

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

    // --- Quota enforcement for free users ---
    const db = getAdminDb();
    let plan: 'free' | 'pro' = 'free';
    try {
      const userDoc = await db.collection('users').doc(uid).get();
      const data = userDoc.data();
      if (data?.subscription?.plan === 'pro' && data?.subscription?.status === 'active') {
        plan = 'pro';
      }
    } catch {
      // Default to free
    }

    if (plan === 'free') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      let sessionsThisMonth = 0;
      try {
        const snapshot = await db
          .collection('interviews')
          .where('userId', '==', uid)
          .where('createdAt', '>=', startOfMonth)
          .get();
        sessionsThisMonth = snapshot.size;
      } catch {
        const snapshot = await db
          .collection('interviews')
          .where('userId', '==', uid)
          .get();
        sessionsThisMonth = snapshot.docs.filter((doc) => {
          const createdAt = doc.data().createdAt;
          return typeof createdAt === 'string' && createdAt >= startOfMonth;
        }).length;
      }

      if (sessionsThisMonth >= FREE_MONTHLY_LIMIT) {
        return NextResponse.json(
          { error: 'Free plan limit reached', code: 'QUOTA_EXCEEDED' },
          { status: 403 },
        );
      }
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

    const { profile, jobDescription, history, overallScore, sessionDurationSeconds, completedAllQuestions, followUpsOffered, followUpsTaken } = body as Record<string, unknown>;

    if (!profile || typeof profile !== 'object') {
      return NextResponse.json({ error: 'profile is required and must be an object' }, { status: 400 });
    }
    if (!Array.isArray(history)) {
      return NextResponse.json({ error: 'history is required and must be an array' }, { status: 400 });
    }
    if (history.length > 100) {
      return NextResponse.json({ error: 'history must have at most 100 entries' }, { status: 400 });
    }

    const docRef = await db.collection('interviews').add({
      userId: uid,
      profile,
      ...(typeof jobDescription === 'string' ? { jobDescription } : {}),
      history,
      overallScore: typeof overallScore === 'number' ? overallScore : 0,
      ...(typeof sessionDurationSeconds === 'number' ? { sessionDurationSeconds } : {}),
      ...(typeof completedAllQuestions === 'boolean' ? { completedAllQuestions } : {}),
      ...(typeof followUpsOffered === 'number' ? { followUpsOffered } : {}),
      ...(typeof followUpsTaken === 'number' ? { followUpsTaken } : {}),
      createdAt: new Date().toISOString(),
    });

    // Clean up any interview draft now that the session is saved
    await db.collection('interview-drafts').doc(uid).delete().catch(() => {});

    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    return handleAuthError(error);
  }
}
