import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';
import { checkRateLimit } from '@/lib/rate-limit';
import { researchRole } from '@/lib/gemini';

export const maxDuration = 60;

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

    const { role, company, resume, focusAreas } = body as Record<string, unknown>;

    if (!role || typeof role !== 'string') {
      return NextResponse.json({ error: 'role is required and must be a string' }, { status: 400 });
    }
    if (!company || typeof company !== 'string') {
      return NextResponse.json({ error: 'company is required and must be a string' }, { status: 400 });
    }
    if (role.length > 200) {
      return NextResponse.json({ error: 'role must be under 200 characters' }, { status: 400 });
    }
    if (company.length > 200) {
      return NextResponse.json({ error: 'company must be under 200 characters' }, { status: 400 });
    }
    if (resume !== undefined && typeof resume !== 'string') {
      return NextResponse.json({ error: 'resume must be a string' }, { status: 400 });
    }
    if (typeof resume === 'string' && resume.length > 10000) {
      return NextResponse.json({ error: 'resume must be under 10000 characters' }, { status: 400 });
    }
    if (focusAreas !== undefined && typeof focusAreas !== 'string') {
      return NextResponse.json({ error: 'focusAreas must be a string' }, { status: 400 });
    }
    if (typeof focusAreas === 'string' && focusAreas.length > 2000) {
      return NextResponse.json({ error: 'focusAreas must be under 2000 characters' }, { status: 400 });
    }

    const result = await researchRole(
      role,
      company,
      typeof resume === 'string' ? resume : '',
      typeof focusAreas === 'string' ? focusAreas : '',
    );
    return NextResponse.json(result);
  } catch (error) {
    return handleAuthError(error);
  }
}
