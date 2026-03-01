import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateSpeech } from '@/lib/gemini';

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

    const { text } = body as Record<string, unknown>;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required and must be a string' }, { status: 400 });
    }
    if (text.length > 5000) {
      return NextResponse.json({ error: 'text must be under 5000 characters' }, { status: 400 });
    }

    const result = await generateSpeech(text);
    return NextResponse.json(result);
  } catch (error) {
    return handleAuthError(error);
  }
}
