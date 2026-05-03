'use client';

import { useEffect, useRef, useState } from 'react';
import { SectionLabel } from '../SectionLabel';
import { Arrow, Check, Spin } from '@/components/Icons';
import { Reveal } from '@/components/Reveal';

function scrollToForm() {
  const el = document.getElementById('diag-form');
  if (!el) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const y = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top: y, behavior: 'smooth' });
  setTimeout(() => {
    const i = el.querySelector('input');
    if (i instanceof HTMLInputElement) i.focus({ preventScroll: true });
  }, 500);
}

const CHECKS = [
  { k: 'E-E-A-T',           q: 'Qui parle, et c’est crédible ?', detail: 'Auteur réel, bio, expérience, pages légales.' },
  { k: 'Helpful Content',   q: 'Ton contenu aide vraiment ?',     detail: 'Profondeur, intention claire, action en sortie.' },
  { k: 'Qualité éditoriale',q: 'C’est lisible et soigné ?',       detail: 'Ton humain, structure, pas de remplissage.' },
  { k: 'Signaux à risque',  q: 'Tu déclenches des alarmes ?',     detail: 'IA brute, thin content, pages dupliquées.' },
];

const STEP_DELAY = 700; // ms entre chaque check qui s'allume

function MockupChecks() {
  const [activeIdx, setActiveIdx] = useState(-1); // -1 idle, 0..3 progressing
  const [doneCount, setDoneCount] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          let i = 0;
          const tick = () => {
            if (i >= CHECKS.length) {
              setActiveIdx(-1);
              return;
            }
            setActiveIdx(i);
            setTimeout(() => {
              setDoneCount((c) => c + 1);
              i += 1;
              setTimeout(tick, 200);
            }, STEP_DELAY);
          };
          tick();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  const allDone = doneCount === CHECKS.length;

  return (
    <div ref={ref} className="rounded-2xl border border-line2 bg-ink2/70 overflow-hidden">
      <div className="px-5 py-3 border-b border-line flex items-center justify-between">
        <div className="font-mono text-[11px] text-mute">checks.run()</div>
        <div className={'font-mono text-[11px] ' + (allDone ? 'text-ok' : activeIdx >= 0 ? 'text-accent' : 'text-mute')}>
          <span className={(allDone ? 'bg-ok' : activeIdx >= 0 ? 'bg-accent' : 'bg-mute') + ' inline-block h-1.5 w-1.5 rounded-full mr-1.5 ' + (activeIdx >= 0 || allDone ? 'blink' : '')} />
          {allDone ? 'done' : activeIdx >= 0 ? 'running' : 'ready'}
        </div>
      </div>
      <ul className="divide-y divide-line">
        {CHECKS.map((c, i) => {
          const isDone = i < doneCount;
          const isActive = activeIdx === i && !isDone;
          const isPending = !isDone && !isActive;
          return (
            <li key={i} className="px-5 sm:px-6 py-4 flex items-start gap-4">
              <div
                className={
                  'h-9 w-9 rounded-lg grid place-items-center font-mono font-semibold shrink-0 transition-colors duration-200 ' +
                  (isDone ? 'bg-ok/15 text-ok'
                    : isActive ? 'bg-accent/15 text-accent'
                    : 'bg-accent/10 text-accent')
                }
              >
                {isDone ? <Check className="h-4 w-4" />
                  : isActive ? <Spin className="h-4 w-4 spin" />
                  : <span>0{i + 1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className={'text-[15px] font-semibold tracking-tight transition-colors ' + (isPending ? 'text-white/70' : 'text-white')}>
                  {c.k}
                </div>
                <div className="text-[13.5px] text-mute leading-snug mt-0.5">{c.q}</div>
                <div className="mt-2 font-mono text-[11.5px] text-mute2">→ {c.detail}</div>
              </div>
              <div className={'shrink-0 mt-1 transition-opacity duration-200 ' + (isDone ? 'opacity-100' : 'opacity-30')}>
                <Check className={'h-4 w-4 ' + (isDone ? 'text-ok' : 'text-mute2')} />
              </div>
            </li>
          );
        })}
      </ul>
      <div className="px-5 sm:px-6 py-4 border-t border-line flex items-center justify-between">
        <div className="font-mono text-[11px] text-mute">output</div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.35)' }}>SAFE</span>
          <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.35)' }}>À RISQUE</span>
          <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.35)' }}>AFFECTÉ</span>
        </div>
      </div>
    </div>
  );
}

export function ToolExplainSection() {
  return (
    <section className="relative border-t border-line/70">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 sm:gap-16 items-start">
          <div>
            <Reveal>
              <SectionLabel n="04">ce que fait l’outil</SectionLabel>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-4 text-[30px] sm:text-[44px] leading-[1.05] font-semibold tracking-[-0.02em]" style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
                Un diagnostic. <span className="text-accent">4 axes.</span> Pas de bla-bla.
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 text-[16px] sm:text-[18px] text-mute max-w-[48ch] leading-snug">
                Tu colles ton URL. On scanne les 4 critères que Google regarde vraiment.
                Tu ressors avec un score, un verdict, et 3 trucs à corriger en priorité.
              </p>
            </Reveal>
            <Reveal delay={240} className="mt-7">
              <button
                onClick={scrollToForm}
                className="inline-flex items-center gap-2 rounded-xl bg-accent hover:bg-accent2 active:scale-[0.98] transition-[transform,background-color] duration-150 px-5 py-3 font-semibold text-[15px] group"
              >
                Lancer le diagnostic
                <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <div className="mt-2 font-mono text-[11.5px] text-mute">gratuit · 30 secondes · sans email</div>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <MockupChecks />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
