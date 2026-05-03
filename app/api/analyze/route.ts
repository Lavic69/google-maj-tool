import { NextRequest, NextResponse } from 'next/server';
import { normalizeUrl } from '@/lib/url-normalize';
import { analyzeSite, AnalyzeError } from '@/lib/analyze';
import type { AnalyzeRequest } from '@/lib/types';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: AnalyzeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const u = normalizeUrl(body.url || '');
  if (!u) {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 });
  }

  try {
    const verdict = await analyzeSite(u);
    return NextResponse.json(verdict);
  } catch (err) {
    if (err instanceof AnalyzeError) {
      console.error(`[analyze] ${err.stage} failed for ${u.hostname}:`, err.message);
      const status = err.stage === 'scrape' ? 502 : 503;
      const message =
        err.stage === 'scrape'
          ? "Le site n'a pas pu être scanné (protection anti-bot ou indisponible)."
          : "L'analyse a échoué. Réessaie dans quelques secondes.";
      return NextResponse.json({ error: message }, { status });
    }
    console.error('[analyze] unexpected error:', err);
    return NextResponse.json({ error: 'unexpected error' }, { status: 500 });
  }
}
