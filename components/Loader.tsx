'use client';

import { useEffect, useState } from 'react';
import { AXES } from '@/lib/verdict-mock';
import { Check, Spin } from './Icons';

interface LoaderProps {
  url: URL;
  onDone: () => void;
}

const STEP_DURATIONS = [950, 900, 850, 950]; // ms par étape ~ 3.6s total

export function Loader({ url, onDone }: LoaderProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    let acc = 200;
    const timers: ReturnType<typeof setTimeout>[] = [];
    AXES.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setStepIdx(i + 1);
          setDone((d) => [...d, i]);
        }, acc + STEP_DURATIONS[i])
      );
      acc += STEP_DURATIONS[i];
    });
    timers.push(
      setTimeout(() => {
        if (!cancelled) onDone();
      }, acc + 350)
    );
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="relative">
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-14 sm:py-24">
        <div className="relative rounded-2xl border border-line2 bg-ink2/70 overflow-hidden">
          <div className="scanline" />
          <div className="px-5 sm:px-8 py-6 sm:py-8 border-b border-line">
            <div className="flex items-center justify-between gap-3">
              <div className="font-mono text-[11.5px] text-mute">running diagnostic</div>
              <div className="font-mono text-[11.5px] text-mute truncate max-w-[60%]">→ {url.hostname}</div>
            </div>
            <div className="mt-3 flex items-baseline gap-3">
              <div className="text-[22px] sm:text-[26px] font-semibold tracking-tight">On scanne ton site…</div>
            </div>
            <div className="mt-1 text-[13.5px] text-mute">Ça prend moins de 30 secondes. Promis.</div>
          </div>

          <ul className="divide-y divide-line">
            {AXES.map((s, i) => {
              const isDone = done.includes(i);
              const isActive = stepIdx === i && !isDone;
              const isPending = i > stepIdx;
              return (
                <li key={s.key} className="px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-4">
                  <div className={'h-7 w-7 rounded-full grid place-items-center shrink-0 ' +
                    (isDone ? 'bg-ok/15 text-ok' :
                     isActive ? 'bg-accent/15 text-accent' :
                                'bg-ink3 text-mute2')}>
                    {isDone && <Check className="h-4 w-4" />}
                    {isActive && <Spin className="h-4 w-4 spin" />}
                    {isPending && <span className="font-mono text-[11px]">0{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={'text-[15.5px] font-semibold tracking-tight ' + (isPending ? 'text-mute2' : 'text-white')}>
                      {s.label}
                    </div>
                    <div className={'text-[12.5px] ' + (isPending ? 'text-mute2' : 'text-mute')}>{s.hint}</div>
                    <div className="mt-2 h-[3px] rounded-full bg-line overflow-hidden">
                      <div
                        className={isActive ? 'barfill h-full bg-accent' : 'h-full'}
                        style={{
                          width: isDone ? '100%' : (isActive ? undefined : '0%'),
                          background: isDone ? '#10B981' : undefined,
                          animationDuration: isActive ? STEP_DURATIONS[i] + 'ms' : undefined,
                        }}
                      />
                    </div>
                  </div>
                  <div className={'font-mono text-[11.5px] ' + (isDone ? 'text-ok' : isActive ? 'text-accent' : 'text-mute2')}>
                    {isDone ? 'ok' : isActive ? '…' : '—'}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="px-5 sm:px-8 py-4 border-t border-line flex items-center justify-between">
            <div className="font-mono text-[11.5px] text-mute">étape {Math.min(stepIdx + 1, AXES.length)} / {AXES.length}</div>
            <div className="font-mono text-[11.5px] text-mute">≈ {Math.max(0, Math.ceil(STEP_DURATIONS.slice(stepIdx).reduce((a, b) => a + b, 0) / 1000))}s restantes</div>
          </div>
        </div>
      </div>
    </section>
  );
}
