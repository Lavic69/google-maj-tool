'use client';

import { useState } from 'react';
import { SectionLabel } from '../SectionLabel';

function FAQItem({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(idx === 0);
  return (
    <div className="border-b border-line">
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left flex items-center justify-between gap-4 py-5 group">
        <span className="text-[16px] sm:text-[18px] font-semibold tracking-tight pr-3" style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}>{q}</span>
        <span className={'shrink-0 h-7 w-7 rounded-full border border-line2 grid place-items-center transition ' + (open ? 'bg-accent border-accent text-white' : 'text-mute group-hover:text-white')}>
          <span className="block relative h-3 w-3">
            <span className="absolute inset-0 m-auto h-[2px] w-3 bg-current rounded" />
            <span className={'absolute inset-0 m-auto h-3 w-[2px] bg-current rounded transition ' + (open ? 'scale-y-0' : 'scale-y-100')} />
          </span>
        </span>
      </button>
      <div className={'grid transition-all duration-300 ease-out ' + (open ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0')}>
        <div className="overflow-hidden">
          <div className="text-[14.5px] sm:text-[15.5px] text-mute leading-relaxed max-w-[60ch] pr-10">{a}</div>
        </div>
      </div>
    </div>
  );
}

export function FAQSection() {
  const items = [
    { q: 'C’est gratuit, vraiment ?',
      a: 'Oui. Pas de carte, pas de compte. On en fait un usage marketing : si t’aimes l’outil, tu reviens.' },
    { q: 'Ça vaut un audit SEO à 3 000 € ?',
      a: 'Non, et ce n’est pas l’idée. C’est un diagnostic rapide. Si t’es dans le rouge, l’audit complet a du sens. Sinon, t’économises 3 000 €.' },
    { q: 'Vous stockez mon URL ?',
      a: 'Non. L’analyse tourne le temps du check. Rien n’est gardé, rien n’est revendu.' },
    { q: 'Je suis dans le rouge — qu’est-ce que je fais ?',
      a: 'Tu prends les 3 fixes prioritaires, tu les traites dans l’ordre. La checklist PDF détaille comment. Si tu veux qu’on s’en occupe, MV Agency fait ça.' },
    { q: 'Pourquoi 4 axes et pas 40 ?',
      a: 'Parce que 40 critères, c’est ce que vendent les outils SEO. 4 axes, c’est ce que Google regarde vraiment depuis 2024.' },
  ];
  return (
    <section className="relative border-t border-line/70 bg-ink">
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-16 sm:py-24">
        <SectionLabel n="07">questions fréquentes</SectionLabel>
        <h2 className="mt-4 text-[30px] sm:text-[44px] leading-[1.05] font-semibold tracking-[-0.02em]" style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
          Ce qu’on nous demande tout le temps.
        </h2>
        <div className="mt-8">
          {items.map((it, i) => <FAQItem key={i} idx={i} q={it.q} a={it.a} />)}
        </div>
      </div>
    </section>
  );
}
