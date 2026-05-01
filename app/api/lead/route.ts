import { NextRequest, NextResponse } from 'next/server';
import type { LeadRequest } from '@/lib/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: LeadRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!body.email || !EMAIL_RE.test(body.email.trim())) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 });
  }

  // TODO demain : push dans Notion via MCP
  console.log('[lead stub]', { email: body.email, domain: body.domain, score: body.score });

  return NextResponse.json({ ok: true });
}
