import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { uid } = await verifyAuth(request);

    const doc = await getAdminDb().collection('interview-drafts').doc(uid).get();
    if (!doc.exists) {
      return NextResponse.json({ draft: null });
    }

    return NextResponse.json({ draft: doc.data() });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { uid } = await verifyAuth(request);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    const draft = body as Record<string, unknown>;

    if (!draft.jobDescription || typeof draft.jobDescription !== 'string') {
      return NextResponse.json({ error: 'jobDescription is required' }, { status: 400 });
    }
    if (!Array.isArray(draft.history)) {
      return NextResponse.json({ error: 'history is required and must be an array' }, { status: 400 });
    }
    if (!Array.isArray(draft.questions)) {
      return NextResponse.json({ error: 'questions is required and must be an array' }, { status: 400 });
    }

    await getAdminDb().collection('interview-drafts').doc(uid).set({
      ...draft,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { uid } = await verifyAuth(request);

    await getAdminDb().collection('interview-drafts').doc(uid).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
