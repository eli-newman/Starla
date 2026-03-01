import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateQuestion } from '@/lib/gemini';

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

    const { history, researchData } = body as Record<string, unknown>;

    if (!researchData || typeof researchData !== 'object') {
      return NextResponse.json({ error: 'researchData is required and must be an object' }, { status: 400 });
    }
    if (history !== undefined && !Array.isArray(history)) {
      return NextResponse.json({ error: 'history must be an array' }, { status: 400 });
    }
    if (Array.isArray(history) && history.length > 50) {
      return NextResponse.json({ error: 'history must have at most 50 entries' }, { status: 400 });
    }

    const result = await generateQuestion(Array.isArray(history) ? history : [], researchData as any);
    return NextResponse.json(result);
  } catch (error) {
    return handleAuthError(error);
  }
}
