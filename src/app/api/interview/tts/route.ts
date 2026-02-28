import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';
import { generateSpeech } from '@/lib/gemini';
import type { TTSRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await verifyAuth(request);
    const body: TTSRequest = await request.json();

    if (!body.text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const result = await generateSpeech(body.text);
    return NextResponse.json(result);
  } catch (error) {
    return handleAuthError(error);
  }
}
