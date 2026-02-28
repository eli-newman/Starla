import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';
import { evaluateAnswer } from '@/lib/gemini';
import type { EvaluateRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await verifyAuth(request);
    const body: EvaluateRequest = await request.json();

    if (!body.question || !body.answer) {
      return NextResponse.json({ error: 'question and answer are required' }, { status: 400 });
    }

    const result = await evaluateAnswer(body.question, body.answer, body.context || {});
    return NextResponse.json(result);
  } catch (error) {
    return handleAuthError(error);
  }
}
