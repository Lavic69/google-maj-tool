import type { Axis, AxisKey, Fix, FixTiming, Observation, Tier, Verdict } from './types';

const FIX_POOL: Fix[] = [
  { t: "Réécris tes 5 pages les plus visitées",        d: "Vire le ton générique. Ajoute ton vécu, des chiffres, des exemples concrets.", effort: "1 semaine", timing: 'soon' },
  { t: "Mets un vrai auteur sur chaque article",        d: "Nom, photo, bio, LinkedIn. Google veut savoir qui parle. Pas “Team Editorial”.", effort: "2 jours", timing: 'now' },
  { t: "Supprime ou fusionne le thin content",          d: "Toute page sous 400 mots qui ne convertit pas : poubelle ou regroupée.", effort: "2 jours", timing: 'soon' },
  { t: "Retravaille les pages générées par IA",         d: "Ajoute un angle perso, une opinion, un cas client. L’IA brute ne passe plus.", effort: "1 semaine", timing: 'later' },
  { t: "Profondeur > volume sur tes pages piliers",     d: "Mieux vaut 8 articles excellents que 40 moyens. Coupe le gras.", effort: "2 semaines", timing: 'later' },
  { t: "Ajoute des preuves : screenshots, captures",    d: "Montre que tu as VRAIMENT fait le truc dont tu parles. E-E-A-T = expérience.", effort: "3 jours", timing: 'soon' },
  { t: "Date et update tes vieux articles",             d: "Mets-les à jour pour 2026, ajoute du neuf, change la date publiquement.", effort: "1 jour", timing: 'now' },
  { t: "Une page = une intention claire",               d: "Si la page essaie de plaire à 3 audiences, elle plaît à zéro.", effort: "2 jours", timing: 'soon' },
  { t: "Renforce les pages “À propos” et “Contact”", d: "Adresse, équipe, mentions légales. Les sites flous se font dégommer.", effort: "1 jour", timing: 'now' },
  { t: "Coupe les CTAs agressifs en haut de page",      d: "Pop-ups, bannières, “téléchargez maintenant” x4 : pénalisé.", effort: "30 min", timing: 'now' },
  { t: "Maillage interne propre vers tes piliers",      d: "Chaque article doit lier au moins 2 pages clés du site.", effort: "2 jours", timing: 'soon' },
  { t: "Vire les articles “top 10 outils” génériques", d: "Recopiés partout. Aucune valeur. Risque rouge sur le prochain update.", effort: "1 jour", timing: 'now' },
];

export const AXES: Array<{ key: AxisKey; label: string; hint: string }> = [
  { key: 'eeat',    label: 'E-E-A-T',           hint: 'Qui parle, et pourquoi on devrait l’écouter.' },
  { key: 'helpful', label: 'Helpful Content',   hint: 'Le site aide vraiment, ou il remplit du vide ?' },
  { key: 'edito',   label: 'Qualité éditoriale', hint: 'Profondeur, ton, soin du texte.' },
  { key: 'risk',    label: 'Signaux à risque',   hint: 'IA brute, thin content, recyclage.' },
];

export const TIER_META: Record<Tier, {
  label: string; emoji: string; color: string; bg: string; ring: string; short: string;
}> = {
  safe: { label: 'SAFE',     emoji: '🟢', color: '#10B981', bg: 'rgba(16,185,129,0.12)', ring: 'rgba(16,185,129,0.35)', short: 'Tu passes le prochain update.' },
  risk: { label: 'À RISQUE', emoji: '🟡', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', ring: 'rgba(245,158,11,0.35)', short: 'Tu es dans la zone grise.' },
  hit:  { label: 'AFFECTÉ',  emoji: '🔴', color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  ring: 'rgba(239,68,68,0.4)',   short: 'Tu vas prendre cher.' },
};

export const TIMING_LABEL: Record<FixTiming, string> = {
  now: 'Cette semaine',
  soon: 'Sem 2-3',
  later: 'D’ici 1 mois',
};

const EXPLAIN_BY: Record<Tier, string[]> = {
  safe: [
    "Ton site coche les bonnes cases. Auteur clair, contenu utile, ton humain.",
    "Le prochain core update ne devrait pas te faire mal. Tu es au-dessus du seuil.",
    "Reste vigilant : un update peut bouger le terrain en 48h.",
  ],
  risk: [
    "Ton site est dans la zone grise. Pas pénalisé, pas protégé.",
    "Quelques signaux faibles : auteurs flous, pages tièdes, ton un peu robotique.",
    "Avec 2 semaines de boulot ciblé, tu sors de la zone à risque.",
  ],
  hit: [
    "Ton site est dans le viseur du prochain core update.",
    "Trop de contenu générique, pas assez de preuve d’expertise réelle.",
    "Bonne nouvelle : c’est rattrapable. Mauvaise : il faut s’y mettre maintenant.",
  ],
};

const MOCK_OBS_BY_AXIS: Record<AxisKey, { good: string; bad: string; neutral: string }> = {
  eeat:    { good: 'Auteur clairement identifié sur les pages',   bad: 'Aucun auteur signé visible',                 neutral: 'Page À propos basique mais présente' },
  helpful: { good: 'Articles avec exemples concrets et chiffrés', bad: 'Articles génériques sans angle perso',       neutral: 'Mélange de contenu utile et de remplissage' },
  edito:   { good: 'Ton humain et structure soignée',             bad: 'Texte plat, faute d’articles, peu structuré', neutral: 'Lisible mais peu de voix singulière' },
  risk:    { good: 'Aucun marqueur d’IA brute visible',           bad: 'Plusieurs signaux IA non retravaillée',      neutral: 'Quelques pages tièdes mais rien de dramatique' },
};

function buildMockObservations(axisKey: AxisKey, score: number): Observation[] {
  const tpl = MOCK_OBS_BY_AXIS[axisKey];
  if (score >= 75) {
    return [
      { sentiment: 'good', text: tpl.good },
      { sentiment: 'good', text: 'Pas de drapeau rouge sur cet axe' },
      { sentiment: 'neutral', text: 'Reste de la marge pour aller plus haut' },
    ];
  }
  if (score >= 50) {
    return [
      { sentiment: 'neutral', text: tpl.neutral },
      { sentiment: 'bad', text: 'Quelques signaux faibles à corriger' },
      { sentiment: 'good', text: 'Base correcte sur laquelle bâtir' },
    ];
  }
  return [
    { sentiment: 'bad', text: tpl.bad },
    { sentiment: 'bad', text: 'Plusieurs critères en zone rouge' },
    { sentiment: 'neutral', text: 'Rattrapable avec 2-4 semaines de boulot' },
  ];
}

function seedFromString(s: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 13), 1597334677);
    h ^= h >>> 16;
    return ((h >>> 0) % 1000) / 1000;
  };
}

export function buildVerdict(url: URL): Verdict {
  const rand = seedFromString(url.hostname + url.pathname);
  const score = Math.round(30 + rand() * 65);
  const tier: Tier = score >= 75 ? 'safe' : score >= 50 ? 'risk' : 'hit';

  const jitter = () => (rand() - 0.5) * 22;
  const axes: Axis[] = AXES.map((a) => {
    const v = Math.max(15, Math.min(98, Math.round(score + jitter())));
    return { ...a, score: v, observations: buildMockObservations(a.key, v) };
  });

  const idxs = new Set<number>();
  while (idxs.size < 3) idxs.add(Math.floor(rand() * FIX_POOL.length));
  const fixes = [...idxs].map((i) => FIX_POOL[i]);

  return { score, tier, axes, fixes, explain: EXPLAIN_BY[tier] };
}
