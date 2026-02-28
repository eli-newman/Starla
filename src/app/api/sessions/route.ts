import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';
import { getAdminDb } from '@/lib/firebase-admin';
import type { SaveSessionRequest } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { uid } = await verifyAuth(request);
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
    const body: SaveSessionRequest = await request.json();

    if (!body.profile || !body.history) {
      return NextResponse.json({ error: 'profile and history are required' }, { status: 400 });
    }

    const docRef = await getAdminDb().collection('interviews').add({
      userId: uid,
      profile: body.profile,
      history: body.history,
      overallScore: body.overallScore,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    return handleAuthError(error);
  }
}
