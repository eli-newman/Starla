import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { uid } = await verifyAuth(request);
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
