'use client';

import { SectionLabel } from '../SectionLabel';
import { Reveal } from '@/components/Reveal';

const TIMELINE = [
  { d: 'mars 2024',  n: 'Helpful Content',       t: 'Google sort la première grosse purge anti-IA générique.', tone: 'warn' as const },
  { d: 'août 2024',  n: 'August Core Update',    t: 'Sites éditoriaux flous : −40% en 3 jours.',               tone: 'bad' as const },
  { d: 'mars 2025',  n: 'March Core Update',     t: 'Renforcement E-E-A-T. Auteur réel devient critique.',     tone: 'warn' as const },
  { d: 'sept. 2025', n: 'September Core Update', t: 'Carnage. Sites IA, sites recyclés : balayés.',            tone: 'bad' as const },
  { d: 'à venir',    n: 'Le prochain',           t: 'On ne sait pas la date. On sait ce qu’il vise.',          tone: 'accent' as const },
];

export function ExplainerSection() {
  return (
    <section className="relative border-t border-line/70">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
        <Reveal>
          <SectionLabel n="02">c’est quoi le truc</SectionLabel>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-4 text-[30px] sm:text-[48px] leading-[1.05] font-semibold tracking-[-0.02em] max-w-[22ch]" style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
            Un “Google Update”, en français pour humains.
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 sm:gap-12 items-start">
          <div className="space-y-5 text-[16.5px] sm:text-[18px] text-white/90 leading-relaxed max-w-[58ch]">
            <Reveal delay={140}>
              <p>
                Plusieurs fois par an, Google change ses règles du jeu.
                Pas un bug, pas un détail. Une <span className="text-white font-semibold">remise à zéro</span> de qui mérite d’être vu.
              </p>
            </Reveal>
            <Reveal delay={220}>
              <p>
                Sa mission depuis 2024 : virer les sites tièdes.
                Trop d’IA brute. Trop de blogs vides. Trop de pages qui ne servent personne.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <p>
                Si ton site coche les cases <span className="text-bad font-semibold">“générique”</span>,
                <span className="text-bad font-semibold"> “sans auteur clair”</span> ou
                <span className="text-bad font-semibold"> “contenu jetable”</span> — tu sors du radar.
                Du jour au lendemain.
              </p>
            </Reveal>
          </div>

          <Reveal delay={200} className="rounded-2xl border border-line2 bg-ink2/70 overflow-hidden">
            <div className="px-5 py-3 border-b border-line flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-bad/60 blink" />
                <span className="h-2.5 w-2.5 rounded-full bg-warn/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-ok/60" />
              </div>
              <div className="font-mono text-[10.5px] text-mute">core_updates · timeline</div>
            </div>
            <ul className="divide-y divide-line">
              {TIMELINE.map((x, i) => {
                const c = x.tone === 'bad' ? '#EF4444' : x.tone === 'warn' ? '#F59E0B' : '#2563EB';
                return (
                  <li key={i} className="risein px-5 py-3.5 flex items-start gap-4" style={{ animationDelay: 320 + i * 100 + 'ms' }}>
                    <span className="font-mono text-[11px] text-mute w-[78px] shrink-0 mt-0.5">{x.d}</span>
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold tracking-tight" style={{ color: c }}>{x.n}</div>
                      <div className="text-[12.5px] text-mute leading-snug">{x.t}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
