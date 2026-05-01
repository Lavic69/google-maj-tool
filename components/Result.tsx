'use client';

import { TIER_META } from '@/lib/verdict-mock';
import type { Verdict } from '@/lib/types';
import { ScoreRing } from './ScoreRing';
import { Restart } from './Icons';

interface ResultProps {
  url: URL;
  verdict: Verdict;
  onRestart: () => void;
}

export function Result({ url, verdict, onRestart }: ResultProps) {
  const meta = TIER_META[verdict.tier];

  return (
    <section className="relative">
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-10 sm:py-16">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11.5px] text-mute">
          <span>verdict pour</span>
          <span className="text-white truncate max-w-[60vw]">
            {url.hostname}
            {url.pathname !== '/' ? url.pathname : ''}
          </span>
          <span>·</span>
          <span>scanné en 3.6s</span>
        </div>

        <div className="pop mt-3 rounded-2xl border bg-ink2/70 overflow-hidden" style={{ borderColor: meta.ring }}>
          <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-6 sm:pb-7" style={{ background: `linear-gradient(180deg, ${meta.bg}, transparent 80%)` }}>
            <div className="flex items-start sm:items-center gap-5 sm:gap-7 flex-col sm:flex-row">
              <ScoreRing score={verdict.score} color={meta.color} />
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-mono" style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.ring}` }}>
                  <span>{meta.emoji}</span>
                  <span className="font-semibold tracking-wide">{meta.label}</span>
                </div>
                <h2 className="mt-3 text-[26px] sm:text-[34px] leading-[1.08] font-semibold tracking-[-0.01em]" style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
                  {meta.short}
                </h2>
                <div className="mt-3 space-y-1.5 text-[14.5px] sm:text-[15.5px] text-white/85 leading-snug">
                  {verdict.explain.map((line, i) => (
                    <p key={i} className="risein" style={{ animationDelay: 120 + i * 90 + 'ms' }}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border-t" style={{ borderColor: '#252A36' }}>
            {verdict.axes.map((a) => {
              const c = a.score >= 75 ? '#10B981' : a.score >= 50 ? '#F59E0B' : '#EF4444';
              return (
                <div key={a.key} className="bg-ink2 p-4">
                  <div className="font-mono text-[10.5px] text-mute uppercase tracking-wider">{a.label}</div>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className="tabular text-[22px] font-semibold" style={{ color: c }}>{a.score}</span>
                    <span className="font-mono text-[11px] text-mute">/100</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-ink3 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: a.score + '%', background: c }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 sm:mt-10">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="font-mono text-[11.5px] text-mute uppercase tracking-wider">priorités</div>
              <h3 className="mt-1 text-[22px] sm:text-[26px] font-semibold tracking-tight">Top 3 fixes</h3>
            </div>
            <div className="font-mono text-[11.5px] text-mute hidden sm:block">à faire avant le prochain update</div>
          </div>

          <ol className="mt-4 sm:mt-5 space-y-2.5">
            {verdict.fixes.map((f, i) => (
              <li key={i} className="risein rounded-xl border border-line bg-ink2/70 p-4 sm:p-5 flex gap-4" style={{ animationDelay: 260 + i * 90 + 'ms' }}>
                <div className="shrink-0 h-8 w-8 rounded-lg bg-accent/15 text-accent grid place-items-center font-mono font-semibold">
                  0{i + 1}
                </div>
                <div className="min-w-0">
                  <div className="text-[15.5px] font-semibold tracking-tight">{f.t}</div>
                  <div className="mt-0.5 text-[13.5px] text-mute leading-snug">{f.d}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex items-center justify-center">
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-full border border-line2 bg-ink2/70 hover:bg-ink3 transition px-4 py-2 text-[13px] font-mono text-mute hover:text-white"
          >
            <Restart className="h-3.5 w-3.5" /> Analyser un autre site
          </button>
        </div>
      </div>
    </section>
  );
}
