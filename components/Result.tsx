'use client';

import { TIER_META, TIMING_LABEL } from '@/lib/verdict-mock';
import type { Axis, Fix, FixTiming, Observation, ObservationSentiment, Verdict } from '@/lib/types';
import { ScoreRing } from './ScoreRing';
import { Restart } from './Icons';

interface ResultProps {
  url: URL;
  verdict: Verdict;
  onRestart: () => void;
}

const SENTIMENT_STYLE: Record<ObservationSentiment, { glyph: string; color: string }> = {
  good:    { glyph: '✓', color: '#10B981' },
  bad:     { glyph: '✗', color: '#EF4444' },
  neutral: { glyph: '·', color: '#8A93A6' },
};

const TIMING_STYLE: Record<FixTiming, { color: string; bg: string; ring: string }> = {
  now:   { color: '#EF4444', bg: 'rgba(239,68,68,0.10)',  ring: 'rgba(239,68,68,0.35)' },
  soon:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', ring: 'rgba(245,158,11,0.35)' },
  later: { color: '#3B82F6', bg: 'rgba(59,130,246,0.10)', ring: 'rgba(59,130,246,0.35)' },
};

function axisColor(score: number): string {
  return score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
}

function ObservationRow({ obs }: { obs: Observation }) {
  const style = SENTIMENT_STYLE[obs.sentiment];
  return (
    <li className="flex items-start gap-2.5">
      <span
        className="font-mono text-[14px] leading-[1.4] shrink-0 mt-[1px] tabular w-3 text-center"
        style={{ color: style.color }}
        aria-hidden="true"
      >
        {style.glyph}
      </span>
      <span className="text-[13.5px] text-white/85 leading-snug">{obs.text}</span>
    </li>
  );
}

function AxisDetailCard({ axis, delay }: { axis: Axis; delay: number }) {
  const c = axisColor(axis.score);
  return (
    <div
      className="risein rounded-xl border border-line bg-ink2/70 p-5"
      style={{ animationDelay: delay + 'ms' }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="font-mono text-[10.5px] text-mute uppercase tracking-wider">{axis.label}</div>
          <div className="text-[12.5px] text-mute leading-snug max-w-[34ch]">{axis.hint}</div>
        </div>
        <div className="flex items-baseline gap-1 shrink-0">
          <span className="tabular text-[26px] font-semibold leading-none" style={{ color: c }}>
            {axis.score}
          </span>
          <span className="font-mono text-[11px] text-mute">/100</span>
        </div>
      </div>

      <div className="mt-3 h-1.5 rounded-full bg-ink3 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: axis.score + '%', background: c }} />
      </div>

      {axis.observations.length > 0 && (
        <ul className="mt-4 space-y-2">
          {axis.observations.map((obs, i) => (
            <ObservationRow key={i} obs={obs} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FixCard({ fix, index, delay }: { fix: Fix; index: number; delay: number }) {
  const tStyle = TIMING_STYLE[fix.timing];
  const tLabel = TIMING_LABEL[fix.timing];
  return (
    <li
      className="risein rounded-xl border border-line bg-ink2/70 p-5 flex flex-col gap-3"
      style={{ animationDelay: delay + 'ms' }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="shrink-0 h-7 w-7 rounded-lg bg-accent/15 text-accent grid place-items-center font-mono font-semibold text-[12.5px]">
          0{index + 1}
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-mono font-semibold"
          style={{ background: tStyle.bg, color: tStyle.color, border: `1px solid ${tStyle.ring}` }}
        >
          {tLabel}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ink3 border border-line2 px-2.5 py-0.5 text-[11.5px] font-mono text-mute">
          ~ {fix.effort}
        </span>
      </div>
      <div>
        <div className="text-[15.5px] sm:text-[16px] font-semibold tracking-tight">{fix.t}</div>
        <div className="mt-1 text-[13.5px] text-mute leading-snug">{fix.d}</div>
      </div>
    </li>
  );
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
              const c = axisColor(a.score);
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

        {/* Diagnostic par axe — observations détaillées */}
        <div className="mt-10 sm:mt-12">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="font-mono text-[11.5px] text-mute uppercase tracking-wider">diagnostic</div>
              <h3 className="mt-1 text-[22px] sm:text-[26px] font-semibold tracking-tight">Ce qu’on a vu, axe par axe</h3>
            </div>
            <div className="font-mono text-[11.5px] text-mute hidden sm:block">observations concrètes</div>
          </div>

          <div className="mt-4 sm:mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {verdict.axes.map((a, i) => (
              <AxisDetailCard key={a.key} axis={a} delay={300 + i * 80} />
            ))}
          </div>
        </div>

        {/* Plan d'action — timeline */}
        <div className="mt-10 sm:mt-12">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="font-mono text-[11.5px] text-mute uppercase tracking-wider">plan d’action</div>
              <h3 className="mt-1 text-[22px] sm:text-[26px] font-semibold tracking-tight">Tes 3 priorités, séquencées</h3>
            </div>
            <div className="font-mono text-[11.5px] text-mute hidden sm:block">par ordre d’impact</div>
          </div>

          <ol className="mt-4 sm:mt-5 space-y-3">
            {verdict.fixes.map((f, i) => (
              <FixCard key={i} fix={f} index={i} delay={500 + i * 90} />
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
