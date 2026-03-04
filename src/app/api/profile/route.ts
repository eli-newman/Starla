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

    const doc = await getAdminDb().collection('profiles').doc(uid).get();

    if (!doc.exists) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({ profile: doc.data() });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PUT(request: NextRequest) {
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

    const { experience, resume } = body as Record<string, unknown>;

    if (!experience || typeof experience !== 'string') {
      return NextResponse.json({ error: 'experience is required and must be a string' }, { status: 400 });
    }

    const validExperiences = ['Entry Level', 'Mid Level', 'Senior', 'Staff/Principal', 'Executive'];
    if (!validExperiences.includes(experience)) {
      return NextResponse.json({ error: `experience must be one of: ${validExperiences.join(', ')}` }, { status: 400 });
    }

    if (resume !== undefined && typeof resume !== 'string') {
      return NextResponse.json({ error: 'resume must be a string' }, { status: 400 });
    }
    if (typeof resume === 'string' && resume.length > 10000) {
      return NextResponse.json({ error: 'resume must be under 10000 characters' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const profileRef = getAdminDb().collection('profiles').doc(uid);
    const existing = await profileRef.get();

    const profileData = {
      experience,
      resume: typeof resume === 'string' ? resume : '',
      updatedAt: now,
      ...(existing.exists ? {} : { createdAt: now }),
    };

    await profileRef.set(profileData, { merge: true });

    const updated = await profileRef.get();
    return NextResponse.json({ profile: updated.data() });
  } catch (error) {
    return handleAuthError(error);
  }
}
