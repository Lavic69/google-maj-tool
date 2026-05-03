import { anthropic, ANTHROPIC_MODEL, isAnthropicConfigured } from './anthropic';
import { scrape, FirecrawlError, ScrapedPage } from './firecrawl';
import { AXES } from './verdict-mock';
import type { Axis, AxisKey, FixTiming, Observation, ObservationSentiment, Tier, Verdict } from './types';

const SYSTEM_PROMPT = `Tu es un auditeur SEO qui évalue le risque qu'un site web prenne une pénalité au prochain Google core update.

Tu notes le site sur 4 axes, chacun /100.

# Définition des 4 axes

## E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
Qui parle ? Pourquoi on devrait l'écouter ?
- 0-25 : aucun auteur visible, "Team Editorial", pas de bio, page À propos vide ou inexistante, pas de mentions légales
- 25-50 : auteur nommé mais aucune preuve d'expérience (pas de LinkedIn, pas de photo, pas de cas concret)
- 50-75 : auteur avec bio basique, mais peu de preuves d'expérience réelle (peu de captures, peu de cas)
- 75-100 : auteur fort avec photos/captures, preuves d'expérience tangibles (cas, projets réels), page À propos détaillée, mentions légales claires

## Helpful Content
Le contenu aide vraiment, ou il remplit du vide ?
- 0-25 : articles "qu'est-ce que..." génériques, top 10 sans test, définitions Wikipedia, surface only
- 25-50 : quelques articles utiles mais beaucoup de remplissage
- 50-75 : contenu majoritairement utile, mais manque de profondeur ou d'action concrète en sortie
- 75-100 : articles avec angles uniques, cas concrets, chiffres, exemples vécus, takeaways actionnables

## Qualité éditoriale
Profondeur, ton, soin du texte.
- 0-25 : texte plat/robotique, structure faible, pas de mise en forme, fautes
- 25-50 : lisible mais peu soigné, peu de structure
- 50-75 : bien structuré (H2/H3, listes), ton lisible, soin moyen
- 75-100 : ton humain et engageant, structure pro, exemples vivants, voix singulière

## Signaux à risque
(score INVERSÉ : 100 = peu de signaux à risque)
- 0-25 : beaucoup d'IA brute non retravaillée, thin content (<400 mots), contenu dupliqué, pages générées en masse
- 25-50 : mélange humain/IA pas clair, ton uniforme suspect
- 50-75 : quelques signaux faibles mais globalement OK
- 75-100 : contenu clairement humain, original, soigné, aucun marqueur IA brute

# Score global et verdict

- Score = moyenne arithmétique des 4 axes (arrondi à l'entier)
- Tier :
  - score ≥ 75 → "safe"
  - 50 ≤ score < 75 → "risk"
  - score < 50 → "hit"

# Observations par axe

Pour CHAQUE axe, tu fournis 3 observations concrètes basées sur ce que tu as vu dans le contenu :
- Chaque observation a un sentiment : "good" (point positif), "bad" (point négatif), "neutral" (constat sans jugement)
- Chaque observation cite un élément précis (titre vu, auteur vu/manquant, ton observé, structure observée)
- PAS de conseil dans les observations — c'est du constat, pas du fix
- Mix typique selon le score :
  - score ≥ 75 : 2 good + 1 neutral, ou 3 good
  - 50-74 : 1 good + 1 neutral + 1 bad
  - < 50 : 2 bad + 1 neutral, ou 3 bad

# Plan d'action (les 3 fixes)

Tu produis 3 fixes, ordonnés par impact (le plus impactant en premier).
Pour chaque fix :
- t : titre court (action verbale, max 70 caractères)
- d : description (max 150 caractères, cite un élément concret du site)
- effort : estimation courte (ex : "30 min", "2h", "1 jour", "2 jours", "1 semaine", "2 semaines")
- timing : quand attaquer ce fix
  - "now" → cette semaine (quick wins, < 1 jour de boulot, ou urgent)
  - "soon" → semaines 2-3 (effort moyen, 1-3 jours)
  - "later" → d'ici 1 mois (gros chantier, ≥ 1 semaine)

Idéalement, répartis les 3 fixes sur les 3 horizons (un now, un soon, un later) pour donner un plan progressif. Si la situation est critique, plusieurs "now" sont OK.

# Règles de production

1. Tu réponds via l'outil submit_verdict. Pas de texte autour.
2. Tu ne notes QUE ce que tu peux observer dans le contenu fourni. Tu ne supposes PAS ce qui n'est pas montré.
3. Si la page scrapée est vide, partielle ou clairement bloquée (anti-bot, captcha, login), tu pénalises Signaux à risque (impossible de juger = signal négatif), tu mentionnes ça dans explain, et tu produis quand même 3 fixes basés sur le peu que tu vois.
4. Tone : tutoie, pas de jargon SEO obscur, phrases courtes (max 15 mots).
5. Le champ "explain" contient EXACTEMENT 3 lignes courtes qui expliquent le verdict.
6. Pas d'emoji dans les sorties. Pas de markdown. Texte brut.`;

const VERDICT_TOOL = {
  name: 'submit_verdict',
  description: "Soumet le verdict structuré sur le risque core update du site analysé.",
  input_schema: {
    type: 'object' as const,
    properties: {
      score: {
        type: 'number',
        description: 'Score global /100, moyenne arithmétique des 4 axes',
      },
      tier: {
        type: 'string',
        enum: ['safe', 'risk', 'hit'],
        description: 'safe si score ≥75, risk si 50-74, hit si <50',
      },
      axes: {
        type: 'array',
        description: 'Les 4 sous-scores avec observations, dans l\'ordre eeat / helpful / edito / risk',
        items: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              enum: ['eeat', 'helpful', 'edito', 'risk'],
            },
            score: {
              type: 'number',
              description: 'Score /100 de cet axe',
            },
            observations: {
              type: 'array',
              description: 'Exactement 3 observations concrètes citant des éléments du site',
              items: {
                type: 'object',
                properties: {
                  sentiment: {
                    type: 'string',
                    enum: ['good', 'bad', 'neutral'],
                    description: 'good = point positif observé, bad = problème observé, neutral = constat sans jugement',
                  },
                  text: {
                    type: 'string',
                    description: 'Observation concrète, max 100 caractères',
                  },
                },
                required: ['sentiment', 'text'],
              },
              minItems: 3,
              maxItems: 3,
            },
          },
          required: ['key', 'score', 'observations'],
        },
        minItems: 4,
        maxItems: 4,
      },
      fixes: {
        type: 'array',
        description: 'Exactement 3 fixes priorisés (impact descendant), chacun avec effort + timing',
        items: {
          type: 'object',
          properties: {
            t: {
              type: 'string',
              description: 'Titre du fix (max 70 caractères, action verbale)',
            },
            d: {
              type: 'string',
              description: 'Description (max 150 caractères, mentionne un élément concret du site)',
            },
            effort: {
              type: 'string',
              description: 'Effort estimé, format court (ex : "30 min", "1 jour", "1 semaine")',
            },
            timing: {
              type: 'string',
              enum: ['now', 'soon', 'later'],
              description: 'now = cette semaine, soon = sem 2-3, later = d\'ici 1 mois',
            },
          },
          required: ['t', 'd', 'effort', 'timing'],
        },
        minItems: 3,
        maxItems: 3,
      },
      explain: {
        type: 'array',
        description: 'Exactement 3 phrases courtes (max 100 caractères chacune) qui expliquent le verdict',
        items: { type: 'string' },
        minItems: 3,
        maxItems: 3,
      },
    },
    required: ['score', 'tier', 'axes', 'fixes', 'explain'],
  },
};

interface RawObservation {
  sentiment: ObservationSentiment;
  text: string;
}

interface RawAxis {
  key: AxisKey;
  score: number;
  observations: RawObservation[];
}

interface RawFix {
  t: string;
  d: string;
  effort: string;
  timing: FixTiming;
}

interface RawVerdict {
  score: number;
  tier: Tier;
  axes: RawAxis[];
  fixes: RawFix[];
  explain: string[];
}

export class AnalyzeError extends Error {
  constructor(message: string, public readonly stage: 'scrape' | 'llm' | 'parse') {
    super(message);
    this.name = 'AnalyzeError';
  }
}

function buildUserPrompt(page: ScrapedPage, hostname: string): string {
  const lines = [
    `# Site à auditer`,
    `URL : ${page.url}`,
    `Hostname : ${hostname}`,
    page.title ? `Titre HTML : ${page.title}` : null,
    page.description ? `Meta description : ${page.description}` : null,
    page.language ? `Langue : ${page.language}` : null,
    ``,
    `# Contenu scrapé (markdown, home page)`,
    page.markdown || '(contenu vide — site potentiellement bloqué ou JS-only)',
  ].filter(Boolean);
  return lines.join('\n');
}

function clamp(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function deriveTier(score: number): Tier {
  if (score >= 75) return 'safe';
  if (score >= 50) return 'risk';
  return 'hit';
}

const VALID_SENTIMENTS: ReadonlySet<ObservationSentiment> = new Set(['good', 'bad', 'neutral']);
const VALID_TIMINGS: ReadonlySet<FixTiming> = new Set(['now', 'soon', 'later']);

function sanitizeObservations(raw: RawObservation[] | undefined): Observation[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 3).map((o) => ({
    sentiment: VALID_SENTIMENTS.has(o?.sentiment) ? o.sentiment : 'neutral',
    text: String(o?.text || '').slice(0, 200),
  }));
}

function hydrateVerdict(raw: RawVerdict): Verdict {
  const score = clamp(raw.score);
  const tier = deriveTier(score);

  const rawByKey = new Map(raw.axes.map((a) => [a.key, a]));
  const axes: Axis[] = AXES.map((meta) => {
    const found = rawByKey.get(meta.key);
    return {
      ...meta,
      score: clamp(found?.score ?? score),
      observations: sanitizeObservations(found?.observations),
    };
  });

  const fixes = raw.fixes.slice(0, 3).map((f) => ({
    t: String(f?.t || '').slice(0, 200),
    d: String(f?.d || '').slice(0, 400),
    effort: String(f?.effort || '').slice(0, 60) || 'à estimer',
    timing: VALID_TIMINGS.has(f?.timing) ? f.timing : 'soon',
  }));

  const explain = raw.explain.slice(0, 3).map((s) => String(s || '').slice(0, 200));

  return { score, tier, axes, fixes, explain };
}

export async function analyzeSite(url: URL): Promise<Verdict> {
  if (!isAnthropicConfigured()) {
    throw new AnalyzeError('ANTHROPIC_API_KEY missing', 'llm');
  }

  let page: ScrapedPage;
  try {
    page = await scrape(url.toString());
  } catch (err) {
    const msg = err instanceof FirecrawlError ? err.message : 'scrape failed';
    throw new AnalyzeError(msg, 'scrape');
  }

  let toolInput: RawVerdict;
  try {
    const response = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 2048,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      tools: [VERDICT_TOOL],
      tool_choice: { type: 'tool', name: 'submit_verdict' },
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(page, url.hostname),
        },
      ],
    });

    const toolUse = response.content.find((b) => b.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      throw new AnalyzeError('Claude did not return a tool_use block', 'parse');
    }
    toolInput = toolUse.input as RawVerdict;
  } catch (err) {
    if (err instanceof AnalyzeError) throw err;
    const msg = err instanceof Error ? err.message : 'llm failed';
    throw new AnalyzeError(msg, 'llm');
  }

  return hydrateVerdict(toolInput);
}
