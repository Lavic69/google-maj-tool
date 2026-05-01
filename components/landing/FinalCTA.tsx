'use client';

import { SectionLabel } from '../SectionLabel';
import { Arrow } from '@/components/Icons';

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

export function FinalCTA() {
  return (
    <section className="relative border-t border-line/70 overflow-hidden">
      <div className="absolute inset-0 -z-0"
           style={{ background: 'radial-gradient(800px 400px at 50% 100%, rgba(37,99,235,0.22), transparent 60%)' }} />
      <div className="relative mx-auto max-w-3xl px-5 sm:px-8 py-20 sm:py-28 text-center">
        <SectionLabel n="08">à toi</SectionLabel>
        <h2 className="mt-4 text-[34px] sm:text-[56px] leading-[1.04] font-semibold tracking-[-0.02em]" style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
          30 secondes pour savoir si tu vas survivre.
        </h2>
        <p className="mt-5 text-[16px] sm:text-[19px] text-mute max-w-[44ch] mx-auto leading-snug">
          Le prochain core update arrive. Tu préfères le découvrir maintenant ou le lundi matin ?
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button onClick={scrollToForm}
            className="inline-flex items-center gap-2 rounded-xl bg-accent hover:bg-accent2 active:scale-[0.99] transition px-6 py-3.5 font-semibold text-[15.5px]">
            Analyser mon site <Arrow className="h-4 w-4" />
          </button>
          <span className="font-mono text-[11.5px] text-mute">gratuit · 30s · sans login</span>
        </div>
      </div>
    </section>
  );
}
