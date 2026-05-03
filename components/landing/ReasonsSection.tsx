'use client';

import { SectionLabel } from '../SectionLabel';
import { Reveal } from '@/components/Reveal';

export function ReasonsSection() {
  const reasons = [
    {
      tag: 'IA brute',
      t: 'Tu as publié 40 articles ChatGPT sans les retravailler.',
      d: 'Google les détecte. Ton site est marqué “contenu de remplissage”.',
      bad: ['articles publiés tels quels', 'aucun avis perso ajouté', 'tons identiques d’une page à l’autre'],
    },
    {
      tag: 'auteur fantôme',
      t: 'Personne ne signe tes contenus.',
      d: 'Ni nom, ni photo, ni preuve d’expérience. Google ne sait pas qui parle.',
      bad: ['articles signés “équipe rédaction”', 'pas de page “à propos” crédible', 'aucun lien LinkedIn ou bio'],
    },
    {
      tag: 'thin content',
      t: 'Tu as 200 pages, dont 150 servent à rien.',
      d: 'Pages courtes, dupliquées, juste là pour le SEO. Pénalisé.',
      bad: ['articles sous 400 mots', 'pages “glossaire” vides', 'pages localisées copiées-collées'],
    },
    {
      tag: 'helpful = 0',
      t: 'Ton contenu n’aide vraiment personne.',
      d: 'Aucun cas concret, aucun chiffre, aucune action claire à la fin.',
      bad: ['articles “qu’est-ce que…”', 'top 10 outils sans test réel', 'définitions recopiées de Wikipedia'],
    },
  ];

  return (
    <section className="relative border-t border-line/70 bg-ink">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
        <Reveal>
          <SectionLabel n="03">pourquoi ça t’est tombé dessus</SectionLabel>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-4 text-[30px] sm:text-[48px] leading-[1.05] font-semibold tracking-[-0.02em] max-w-[22ch]" style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
            Les 4 raisons pour lesquelles ton site dégage.
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-5 text-[16px] sm:text-[18px] text-mute max-w-[58ch] leading-snug">
            Spoiler : si tu as fait du contenu en 2023-2024 sans cadre clair, tu en coches au moins deux.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {reasons.map((r, i) => (
            <Reveal key={i} delay={240 + i * 100} className="lift rounded-2xl border border-line bg-ink2/60 p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-bad uppercase tracking-wider">#{i+1} · {r.tag}</span>
                <span className="font-mono text-[10.5px] text-mute2">red flag</span>
              </div>
              <div>
                <div className="text-[19px] sm:text-[22px] font-semibold tracking-tight leading-snug" style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
                  {r.t}
                </div>
                <div className="mt-2 text-[14px] text-mute leading-snug">{r.d}</div>
              </div>
              <ul className="mt-auto space-y-1.5">
                {r.bad.map((b, j) => (
                  <li key={j} className="flex items-start gap-2 text-[13px] text-white/75">
                    <span className="mt-[7px] h-1 w-1 rounded-full bg-bad shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
