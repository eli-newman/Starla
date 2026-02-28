import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';
import { transcribeAudio } from '@/lib/gemini';
import type { TranscribeRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await verifyAuth(request);
    const body: TranscribeRequest = await request.json();

    if (!body.audioBase64 || !body.mimeType) {
      return NextResponse.json({ error: 'audioBase64 and mimeType are required' }, { status: 400 });
    }

    const text = await transcribeAudio(body.audioBase64, body.mimeType);
    return NextResponse.json({ text });
  } catch (error) {
    return handleAuthError(error);
  }
}
