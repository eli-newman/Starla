import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';
import { generateQuestion } from '@/lib/gemini';
import type { QuestionRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await verifyAuth(request);
    const body: QuestionRequest = await request.json();

    if (!body.researchData) {
      return NextResponse.json({ error: 'researchData is required' }, { status: 400 });
    }

    const result = await generateQuestion(body.history || [], body.researchData);
    return NextResponse.json(result);
  } catch (error) {
    return handleAuthError(error);
  }
}
