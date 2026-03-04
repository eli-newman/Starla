import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { uid } = await verifyAuth(request);
    const db = getAdminDb();

    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    const subscription = userData?.subscription || null;

    const plan = subscription?.plan || 'free';
    const isActive = plan === 'pro' && (subscription?.status === 'active' || subscription?.status === 'trialing');

    return NextResponse.json({
      plan: isActive ? 'pro' : 'free',
      subscription: isActive ? subscription : null,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
