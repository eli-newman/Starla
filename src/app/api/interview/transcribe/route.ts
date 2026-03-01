import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';
import { checkRateLimit } from '@/lib/rate-limit';
import { transcribeAudio } from '@/lib/gemini';

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

    const { audioBase64, mimeType } = body as Record<string, unknown>;

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return NextResponse.json({ error: 'audioBase64 is required and must be a non-empty string' }, { status: 400 });
    }
    if (!mimeType || typeof mimeType !== 'string') {
      return NextResponse.json({ error: 'mimeType is required and must be a string' }, { status: 400 });
    }
    if (mimeType.length > 100) {
      return NextResponse.json({ error: 'mimeType must be under 100 characters' }, { status: 400 });
    }

    const text = await transcribeAudio(audioBase64, mimeType);
    return NextResponse.json({ text });
  } catch (error) {
    return handleAuthError(error);
  }
}
