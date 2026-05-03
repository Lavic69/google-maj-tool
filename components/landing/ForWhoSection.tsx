'use client';

import { SectionLabel } from '../SectionLabel';
import { Reveal } from '@/components/Reveal';

export function ForWhoSection() {
  const segs = [
    { tag: 'dirigeant PME', t: 'Tu paies une agence et tu sais pas si elle gère le sujet.', d: 'Tu veux une réponse en 30s, sans devenir expert SEO.' },
    { tag: 'fondateur SaaS', t: 'Ton blog était ta meilleure source de leads. Plus maintenant.', d: 'Tu veux savoir si ça revient ou si c’est mort.' },
    { tag: 'agence / freelance', t: 'Tu veux pitcher tes clients avec un vrai diagnostic.', d: 'Tu veux un point de départ concret pour le devis.' },
  ];
  return (
    <section className="relative border-t border-line/70">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
        <Reveal>
          <SectionLabel n="06">c’est pour qui</SectionLabel>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-4 text-[30px] sm:text-[44px] leading-[1.05] font-semibold tracking-[-0.02em] max-w-[26ch]" style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
            Si tu te reconnais ici, lance le test.
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {segs.map((s, i) => (
            <Reveal key={i} delay={180 + i * 110} className="lift rounded-2xl border border-line bg-ink2/60 p-5 sm:p-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/30 px-2.5 py-0.5 text-[11px] font-mono text-accent">
                {s.tag}
              </div>
              <div className="mt-4 text-[18px] sm:text-[20px] font-semibold tracking-tight leading-snug" style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
                {s.t}
              </div>
              <div className="mt-2 text-[13.5px] text-mute leading-snug">{s.d}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
