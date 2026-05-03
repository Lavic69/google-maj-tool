import { NextRequest, NextResponse } from 'next/server';
import type { LeadRequest } from '@/lib/types';
import { notion, NOTION_LEADS_DB_ID, isNotionConfigured } from '@/lib/notion';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: LeadRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const email = (body.email || '').trim();
  const domain = (body.domain || '').trim();
  const score = typeof body.score === 'number' ? body.score : 0;

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 });
  }

  if (!isNotionConfigured()) {
    console.warn('[lead] Notion env vars missing — lead not persisted:', { email, domain, score });
    return NextResponse.json({ ok: true });
  }

  try {
    await notion.pages.create({
      parent: { database_id: NOTION_LEADS_DB_ID },
      properties: {
        email: {
          title: [{ text: { content: email } }],
        },
        date_signup: {
          date: { start: new Date().toISOString().split('T')[0] },
        },
        first_domain: {
          rich_text: [{ text: { content: domain } }],
        },
        first_score: {
          number: score,
        },
      },
    });
  } catch (err) {
    console.error('[lead] Notion push failed:', err);
    // On garde 200 côté user pour ne pas casser le flow ; l'erreur est loggée
    // côté serveur pour monitoring.
  }

  return NextResponse.json({ ok: true });
}
