import { SectionLabel } from '../SectionLabel';
import { Arrow } from '@/components/Icons';

export function CarnageSection() {
  const stats = [
    { n: '–62%',  l: 'de trafic en moyenne sur les sites pénalisés', s: 'données agrégées 2024-2025' },
    { n: '14j',   l: 'pour qu’un site touché perde la moitié de son SEO', s: 'observation terrain MV Agency' },
    { n: '4 / 5', l: 'sites ne s’en remettent jamais sans intervention',   s: 'core update post-mortem' },
  ];
  return (
    <section className="relative border-t border-line/70 bg-ink">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
        <SectionLabel n="01">le contexte</SectionLabel>
        <h2 className="mt-4 text-[30px] sm:text-[48px] leading-[1.05] font-semibold tracking-[-0.02em] max-w-[20ch]" style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
          Septembre 2025 : <span className="text-bad">carnage</span> sur des milliers de sites.
        </h2>
        <p className="mt-5 text-[16px] sm:text-[19px] text-mute max-w-[58ch] leading-snug">
          Du jour au lendemain. Trafic divisé par 3. Demandes de devis à zéro.
          Des dirigeants qui découvrent par accident qu’ils n’existent plus sur Google.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="rounded-2xl border border-line bg-ink2/60 p-5 sm:p-6">
              <div className="font-mono text-[11px] text-mute">stat 0{i+1}</div>
              <div className="mt-1 text-[44px] sm:text-[52px] leading-none font-semibold tracking-[-0.03em] text-white tabular">{s.n}</div>
              <div className="mt-3 text-[14.5px] text-white/85 leading-snug">{s.l}</div>
              <div className="mt-2 font-mono text-[11px] text-mute2">{s.s}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-line2 bg-ink2/70 overflow-hidden">
          <div className="px-5 sm:px-8 py-5 border-b border-line flex items-center justify-between gap-3">
            <div className="font-mono text-[11.5px] text-mute uppercase tracking-wider">étude de cas anonymisée</div>
            <div className="font-mono text-[11.5px] text-mute">site B2B · 80k visites/mois</div>
          </div>
          <div className="p-5 sm:p-8 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-6 sm:gap-10 items-end">
            <div>
              <div className="font-mono text-[11px] text-mute">avant</div>
              <div className="mt-1 text-[28px] sm:text-[34px] font-semibold tabular">82 400</div>
              <div className="text-[12.5px] text-mute">visites/mois · août 2025</div>
              <div className="mt-3 h-2 rounded-full bg-line overflow-hidden">
                <div className="h-full bg-white/60" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-center gap-1">
              <Arrow className="h-5 w-5 text-bad" />
              <div className="font-mono text-[11px] text-bad">−71%</div>
            </div>
            <div>
              <div className="font-mono text-[11px] text-mute">après</div>
              <div className="mt-1 text-[28px] sm:text-[34px] font-semibold tabular text-bad">23 900</div>
              <div className="text-[12.5px] text-mute">visites/mois · novembre 2025</div>
              <div className="mt-3 h-2 rounded-full bg-line overflow-hidden">
                <div className="h-full bg-bad" style={{ width: '29%' }} />
              </div>
            </div>
          </div>
          <div className="px-5 sm:px-8 py-4 border-t border-line text-[13px] text-mute leading-snug">
            « On comprenait pas. On avait rien changé. C’est exactement le problème. »
            <span className="ml-2 font-mono text-[11px] text-mute2">— founder, agence conseil</span>
          </div>
        </div>
      </div>
    </section>
  );
}
