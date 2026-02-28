import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';
import { researchRole } from '@/lib/gemini';
import type { ResearchRequest } from '@/types';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    await verifyAuth(request);
    const body: ResearchRequest = await request.json();

    if (!body.role || !body.company) {
      return NextResponse.json({ error: 'role and company are required' }, { status: 400 });
    }

    const result = await researchRole(body.role, body.company, body.resume || '', body.focusAreas || '');
    return NextResponse.json(result);
  } catch (error) {
    return handleAuthError(error);
  }
}
