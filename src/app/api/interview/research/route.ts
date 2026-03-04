import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';
import { checkRateLimit } from '@/lib/rate-limit';
import { researchJob } from '@/lib/gemini';
import { getAdminDb } from '@/lib/firebase-admin';

export const maxDuration = 60;

async function hashJD(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.slice(0, 5000));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: NextRequest) {
  try {
    const { uid } = await verifyAuth(request);

    const rateLimitResult = checkRateLimit(uid, 'interview');
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

    const { jobDescription, resume, experience } = body as Record<string, unknown>;

    if (!jobDescription || typeof jobDescription !== 'string') {
      return NextResponse.json({ error: 'jobDescription is required and must be a string' }, { status: 400 });
    }
    if (jobDescription.length > 10000) {
      return NextResponse.json({ error: 'jobDescription must be under 10000 characters' }, { status: 400 });
    }
    if (resume !== undefined && typeof resume !== 'string') {
      return NextResponse.json({ error: 'resume must be a string' }, { status: 400 });
    }
    if (typeof resume === 'string' && resume.length > 10000) {
      return NextResponse.json({ error: 'resume must be under 10000 characters' }, { status: 400 });
    }
    if (experience !== undefined && typeof experience !== 'string') {
      return NextResponse.json({ error: 'experience must be a string' }, { status: 400 });
    }
    // Check research cache (non-blocking — don't let cache errors kill the request)
    const hash = await hashJD(jobDescription);
    let db: ReturnType<typeof getAdminDb> | null = null;
    let cacheRef: FirebaseFirestore.DocumentReference | null = null;

    try {
      db = getAdminDb();
      cacheRef = db.collection('research-cache').doc(hash);
      const cached = await cacheRef.get();

      if (cached.exists) {
        const data = cached.data()!;
        const createdAt = new Date(data.createdAt).getTime();
        if (Date.now() - createdAt < CACHE_TTL_MS) {
          return NextResponse.json(data.result);
        }
      }
    } catch (cacheErr) {
      console.error('Research cache read failed (continuing without cache):', cacheErr);
      cacheRef = null;
    }

    const result = await researchJob(
      jobDescription,
      typeof resume === 'string' ? resume : '',
      typeof experience === 'string' ? experience : '',
    );

    // Store in cache (non-blocking)
    if (cacheRef) {
      cacheRef.set({
        result,
        createdAt: new Date().toISOString(),
        userId: uid,
      }).catch((err: unknown) => console.error('Research cache write failed:', err));
    }

    return NextResponse.json(result);
  } catch (error) {
    if (!(error instanceof Error && error.name === 'AuthError')) {
      console.error('Research route error:', error);
    }
    return handleAuthError(error);
  }
}
