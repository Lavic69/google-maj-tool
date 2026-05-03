'use client';

import { SectionLabel } from '../SectionLabel';
import { Arrow } from '@/components/Icons';
import { Reveal } from '@/components/Reveal';

export function HowItWorksSection() {
  const steps = [
    { t: 'Tu colles ton URL', d: 'Pas d’inscription, pas de carte, pas d’“appel découverte”.' },
    { t: 'On analyse 4 axes', d: 'E-E-A-T, Helpful Content, qualité éditoriale, signaux à risque.' },
    { t: 'Tu reçois ton verdict', d: 'Score sur 100, badge couleur, et tes 3 priorités à corriger.' },
  ];
  return (
    <section className="relative border-t border-line/70 bg-ink">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
        <Reveal>
          <SectionLabel n="05">comment ça marche</SectionLabel>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-4 text-[30px] sm:text-[48px] leading-[1.05] font-semibold tracking-[-0.02em] max-w-[22ch]" style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
            3 étapes. 30 secondes.
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 relative">
          {steps.map((s, i) => (
            <Reveal key={i} delay={200 + i * 130} className="lift relative rounded-2xl border border-line bg-ink2/60 p-6 sm:p-7">
              <div className="font-mono text-[44px] sm:text-[60px] leading-none font-semibold text-accent/80 tracking-tight tabular">
                0{i+1}
              </div>
              <div className="mt-4 text-[19px] sm:text-[22px] font-semibold tracking-tight">{s.t}</div>
              <div className="mt-2 text-[14px] text-mute leading-snug">{s.d}</div>
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-ink border border-line2 items-center justify-center">
                  <Arrow className="h-3.5 w-3.5 text-mute" />
                </div>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
