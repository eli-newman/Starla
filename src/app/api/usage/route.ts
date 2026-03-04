import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';
import { checkRateLimit } from '@/lib/rate-limit';
import { getAdminDb } from '@/lib/firebase-admin';

const FREE_MONTHLY_LIMIT = 3;

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

    const db = getAdminDb();

    // Get start of current month in ISO format
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Count sessions this month
    let sessionsThisMonth = 0;
    try {
      const snapshot = await db
        .collection('interviews')
        .where('userId', '==', uid)
        .where('createdAt', '>=', startOfMonth)
        .get();
      sessionsThisMonth = snapshot.size;
    } catch {
      // Composite index may not exist — fall back to client-side filter
      const snapshot = await db
        .collection('interviews')
        .where('userId', '==', uid)
        .get();
      sessionsThisMonth = snapshot.docs.filter(
        (doc) => {
          const createdAt = doc.data().createdAt;
          return typeof createdAt === 'string' && createdAt >= startOfMonth;
        },
      ).length;
    }

    // Read user's subscription plan
    let plan: 'free' | 'pro' = 'free';
    try {
      const userDoc = await db.collection('users').doc(uid).get();
      const data = userDoc.data();
      if (data?.subscription?.plan === 'pro' && data?.subscription?.status === 'active') {
        plan = 'pro';
      }
    } catch {
      // Default to free if we can't read the user doc
    }

    return NextResponse.json({
      sessionsThisMonth,
      limit: plan === 'pro' ? Infinity : FREE_MONTHLY_LIMIT,
      plan,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
