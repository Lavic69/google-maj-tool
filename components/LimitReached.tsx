'use client';

import { Restart } from './Icons';

interface LimitReachedProps {
  onBackHome: () => void;
}

export function LimitReached({ onBackHome }: LimitReachedProps) {
  return (
    <section className="relative">
      <div className="mx-auto max-w-2xl px-5 sm:px-8 py-20 sm:py-28 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-ink2/60 backdrop-blur px-3 py-1 text-[11.5px] font-mono text-mute">
          <span className="h-1.5 w-1.5 rounded-full bg-warn" />
          <span>quota atteint</span>
        </div>

        <h2 className="mt-5 text-[28px] sm:text-[40px] leading-[1.05] font-semibold tracking-[-0.02em]" style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
          Tu as utilisé tes 2 analyses gratuites.
        </h2>

        <p className="mt-4 text-[15.5px] sm:text-[17px] text-mute max-w-[44ch] mx-auto leading-snug">
          Reviens dans quelques jours, ou contacte MV Agency pour un audit complet.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={onBackHome}
            className="inline-flex items-center gap-2 rounded-full border border-line2 bg-ink2/70 hover:bg-ink3 transition px-4 py-2 text-[13px] font-mono text-mute hover:text-white"
          >
            <Restart className="h-3.5 w-3.5" /> retour à l’accueil
          </button>
        </div>
      </div>
    </section>
  );
}
