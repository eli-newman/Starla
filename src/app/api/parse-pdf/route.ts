import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  let authed = false;
  try {
    await verifyAuth(request);
    authed = true;

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10 MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let text: string;
    try {
      // Import from lib/pdf-parse directly to avoid the index.js bug
      // where pdf-parse tries to load a test PDF when module.parent is null (webpack)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse/lib/pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;
      const result = await pdfParse(buffer);
      text = result.text;
    } catch (parseErr) {
      console.error('pdf-parse failed:', parseErr);
      return NextResponse.json(
        { error: 'Failed to parse PDF. The file may be corrupted or password-protected.' },
        { status: 422 },
      );
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'Could not extract text from this PDF. Try pasting your resume instead.' },
        { status: 422 },
      );
    }

    return NextResponse.json({ text: text.slice(0, 10000) });
  } catch (error) {
    if (!authed) {
      return handleAuthError(error);
    }
    console.error('parse-pdf unexpected error:', error);
    return NextResponse.json(
      { error: 'Something went wrong parsing the PDF. Try pasting your resume text instead.' },
      { status: 500 },
    );
  }
}
