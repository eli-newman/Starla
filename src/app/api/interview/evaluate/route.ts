import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';
import { checkRateLimit } from '@/lib/rate-limit';
import { evaluateAnswer } from '@/lib/gemini';

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

    const { question, answer, context } = body as Record<string, unknown>;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'question is required and must be a string' }, { status: 400 });
    }
    if (!answer || typeof answer !== 'string') {
      return NextResponse.json({ error: 'answer is required and must be a string' }, { status: 400 });
    }
    if (question.length > 5000) {
      return NextResponse.json({ error: 'question must be under 5000 characters' }, { status: 400 });
    }
    if (answer.length > 5000) {
      return NextResponse.json({ error: 'answer must be under 5000 characters' }, { status: 400 });
    }

    const result = await evaluateAnswer(question, answer, (context as any) || {});
    return NextResponse.json(result);
  } catch (error) {
    return handleAuthError(error);
  }
}
