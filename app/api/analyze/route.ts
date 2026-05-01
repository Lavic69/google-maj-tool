import { NextRequest, NextResponse } from 'next/server';
import { buildVerdict } from '@/lib/verdict-mock';
import { normalizeUrl } from '@/lib/url-normalize';
import type { AnalyzeRequest } from '@/lib/types';

const SIMULATED_LATENCY_MS = 3000;

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

  await new Promise((r) => setTimeout(r, SIMULATED_LATENCY_MS));

  const verdict = buildVerdict(u);
  return NextResponse.json(verdict);
}
