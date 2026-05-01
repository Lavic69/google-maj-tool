# Google Update Survivor — Design Spec

**Date :** 2026-05-01
**Auteur :** Victor Marchetti / MV Agency
**Repo :** https://github.com/Lavic69/google-maj-tool

## Contexte

Outil interactif qui analyse le risque qu'un site web prenne une pénalité au prochain Google Core Update. L'utilisateur entre une URL, reçoit un verdict (🟢 SAFE / 🟡 À RISQUE / 🔴 AFFECTÉ), un score /100, et 3 priorités d'action — basé sur 4 axes (E-E-A-T, Helpful Content, qualité éditoriale, signaux à risque).

Diffusion principale : posts LinkedIn Victor Marchetti.

## État de départ

Un fichier HTML monobloc (`Google Update Survivor.html`, 1163 lignes) contenant :

- Toute l'interface React (Hero, Loader, Result, lead magnet) via CDN
- Tailwind v3 via CDN avec config inline (palette dark, fonts DM Sans/DM Mono, animations)
- **Verdict 100% mocké** : `buildVerdict(url)` génère un score pseudo-aléatoire seedé sur le hostname et pioche 3 fixes au hasard dans un pool de 8 phrases génériques. Aucune analyse réelle.

## Objectif

Transformer ce HTML statique en outil **réellement fonctionnel** déployé sur Vercel, avec :

- Vraie analyse via Firecrawl (scraping) + Claude Haiku 4.5 (évaluation)
- Limite : **2 analyses gratuites par personne** (1 sans email, 1 contre email)
- Capture des emails dans Notion
- Coût opérationnel maîtrisé (~3-4 cts par analyse, cap dur à ~100/jour)

## Périmètre du build initial (ce soir)

Construction de **toute la structure projet et l'UI fonctionnelle**, avec les endpoints API en **stub** (mocks préservés). Les vraies intégrations (Firecrawl, Anthropic, Notion, rate limit serveur) sont reportées au build suivant.

## Architecture

### Stack technique

| Brique | Outil | Statut compte |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | À créer |
| Styling | Tailwind CSS v3 | Inclus avec Next.js |
| Hébergement | Vercel | Existant |
| Scraping (demain) | Firecrawl (free tier 500 pages/mois) | À créer |
| LLM (demain) | Claude Haiku 4.5 via Anthropic SDK | Existant |
| Capture email (demain) | Notion API via MCP | Existant |
| Anti-abus (demain) | Vercel middleware rate limit + cookie + cap global | Inclus |

### Structure du projet

```
google-update-survivor/
├── app/
│   ├── page.tsx                 # Orchestration des états (idle/loading/result/emailGate/limitReached)
│   ├── layout.tsx               # Layout root avec fonts
│   ├── globals.css              # Tailwind + animations custom du HTML existant
│   └── api/
│       ├── analyze/route.ts     # POST /api/analyze (stub aujourd'hui)
│       └── lead/route.ts        # POST /api/lead (stub aujourd'hui)
├── components/
│   ├── TopBar.tsx
│   ├── Hero.tsx                 # Form URL avec validation
│   ├── Loader.tsx               # Animation 4 checks (3-4s)
│   ├── Result.tsx               # Verdict + score + axes + fixes
│   ├── ScoreRing.tsx            # Composant score circulaire animé
│   ├── EmailGate.tsx            # Capture email pour 2e analyse
│   └── LimitReached.tsx         # Message "limite atteinte"
├── lib/
│   ├── usage-cookie.ts          # Helpers lecture/écriture cookie d'usage
│   ├── verdict-mock.ts          # Mock actuel préservé (réutilisé par stub /api/analyze)
│   ├── url-normalize.ts         # Normalisation URL (extrait du HTML actuel)
│   └── types.ts                 # Verdict, Axis, Tier, UsageCookie
├── public/
├── tailwind.config.ts           # Config dérivée du HTML (couleurs ink/accent/ok/warn/bad, fonts)
├── next.config.js
├── tsconfig.json
├── package.json
└── .env.example                 # Placeholders pour FIRECRAWL_API_KEY, ANTHROPIC_API_KEY, NOTION_TOKEN
```

### Flow utilisateur (machine à états)

```
idle ──(submit URL)──> loading ──(~3s)──> result
                                            │
                                            ├─ Click "Analyser un autre site"
                                            │     │
                                            │     └─> Lecture cookie gus_usage :
                                            │         - count == 0 → impossible (on est dans result, count est >= 1)
                                            │         - count == 1 && !emailProvided → emailGate
                                            │         - count == 1 && emailProvided → idle
                                            │         - count == 2 → limitReached
                                            │
                                            └─ emailGate ──(email entré)──> POST /api/lead
                                                              │
                                                              └──> idle (cookie marqué emailProvided=true)
```

## Composants & responsabilités

### Migrés sans changement fonctionnel depuis le HTML

- **TopBar** — header avec logo et indicateur "live"
- **Hero** — eyebrow, titre, sous-titre, formulaire URL avec validation `normalizeUrl`
- **Loader** — animation des 4 checks séquentiels (E-E-A-T, Helpful Content, Qualité éditoriale, Signaux à risque)
- **ScoreRing** — score circulaire animé avec count-up
- **Result** — badge verdict, score, 3 phrases d'explication, sous-scores par axe, top 3 fixes

### Nouveaux

- **EmailGate** — écran qui s'affiche au clic "analyser un autre site" si `count == 1 && !emailProvided`. Champ email + bouton "Débloquer une analyse". Au submit : POST `/api/lead` puis transition vers `idle`.
- **LimitReached** — message si `count == 2`. Pas de CTA bloquant ; juste un texte expliquant qu'il faut revenir un autre jour.

### Supprimés

- Le bloc actuel "Lead magnet PDF" en bas du résultat (sections 4 du brief original) — la logique change : on ne donne plus de PDF, l'email sert juste à débloquer une 2e analyse.

## Endpoints API

### `POST /api/analyze`

**Input :**
```ts
{ url: string }
```

**Output :**
```ts
{
  score: number,            // 0-100
  tier: 'safe' | 'risk' | 'hit',
  axes: Array<{
    key: 'eeat' | 'helpful' | 'edito' | 'risk',
    label: string,
    hint: string,
    score: number
  }>,                       // toujours 4
  fixes: Array<{ t: string, d: string }>,  // toujours 3
  explain: string[]         // toujours 3 phrases
}
```

**Comportement :**

- **Aujourd'hui (stub)** : appelle `verdict-mock.ts` (la fonction `buildVerdict` du HTML actuel). `setTimeout(3000)` côté server pour simuler la latence d'une vraie analyse.
- **Demain** : Firecrawl → home + 3-5 pages via sitemap → prompt structuré envoyé à Claude Haiku 4.5 → parse JSON → renvoi du verdict.

**Erreurs :**

- `400` si URL invalide
- `429` si rate limit dépassé (demain)
- `503` si cap global jour atteint (demain)
- `500` si erreur upstream (Firecrawl/Anthropic — demain)

### `POST /api/lead`

**Input :**
```ts
{
  email: string,
  domain: string,           // domaine de la 1re analyse, pour contextualiser
  score: number             // score de la 1re analyse
}
```

**Output :**
```ts
{ ok: true }
```

**Comportement :**

- **Aujourd'hui (stub)** : valide l'email (regex), retourne 200.
- **Demain** : push d'une nouvelle ligne dans la Notion DB "GUS Leads" via le MCP Notion.

**Erreurs :**

- `400` si email invalide

## Data model

### Cookie `gus_usage`

Cookie navigateur, sérialisé JSON, durée 90 jours, `SameSite=Lax`, écrit côté client (pas besoin de signing — le rate limit serveur sera la vraie barrière).

```ts
type UsageCookie = {
  count: 0 | 1 | 2;
  emailProvided: boolean;
  domains: string[];        // domaines déjà analysés (pour affichage / suite)
}
```

Mis à jour à 3 moments :
- Après réponse OK de `/api/analyze` → `count++`, push du domaine
- Après réponse OK de `/api/lead` → `emailProvided = true`
- Reset manuel possible via `lib/usage-cookie.ts:resetUsage()` (utilisé pour debug)

### Notion DB "GUS Leads" (à créer demain)

| Colonne | Type |
|---|---|
| email | Title |
| date_signup | Date |
| first_domain | Rich text |
| second_domain | Rich text (optionnel) |
| first_score | Number |
| second_score | Number (optionnel) |

## Anti-abus (demain)

Trois couches indépendantes :

1. **Cookie côté client** (`gus_usage`) — rapide, gère 90% des cas honnêtes.
2. **Vercel middleware rate limit** — 5 req/min/IP en natif (sans Upstash).
3. **Cap global jour** — variable d'env `MAX_ANALYSES_PER_DAY=100`. Compteur en mémoire serveur (reset à chaque cold start, acceptable à cette échelle). Si dépassé → 503 avec message clair côté client.

Limite acceptée : un user qui efface ses cookies + change d'IP peut refaire des analyses. C'est OK : le cap global protège la facture.

## Migration du HTML existant

Le HTML actuel (1163 lignes) contient déjà tout en React via CDN. Migration ligne à ligne :

1. **Extraire la config Tailwind** (lignes 14-37 du HTML) → `tailwind.config.ts`
2. **Extraire les styles custom** (lignes 40-115, animations `blink`, `spin`, `barfill`, `risein`, `pop`, `scan`, etc.) → `app/globals.css`
3. **Extraire les constantes** (`AXES`, `FIX_POOL`, `TIER_META`, `explainBy`) → `lib/verdict-mock.ts` et `lib/types.ts`
4. **Extraire `seedFromString`, `buildVerdict`, `normalizeUrl`** → `lib/`
5. **Découper le composant App monolithique** → `components/*.tsx`
6. **Convertir l'orchestration `useState({ phase, url, verdict })`** → `app/page.tsx`

## Plan de build de ce soir (étapes ordonnées)

Le projet Next.js est initialisé **directement dans `/Users/lavic/Desktop/Google survivor tool/`** (le dossier actuel devient la racine du projet, pas un sous-dossier). Le HTML de référence est déplacé dans `docs/reference/` pour pouvoir s'y référer pendant la migration sans qu'il soit servi en prod.

1. Déplacer `Google Update Survivor.html` → `docs/reference/original-design.html`
2. Initialiser Next.js dans le dossier courant : `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"` (le dossier doit être vide à part `docs/`, donc s'assurer que rien d'autre ne traîne)
3. Migrer `tailwind.config.ts` (couleurs custom `ink/ink2/ink3/line/line2/accent/accent2/ok/warn/bad/mute/mute2`, fonts, extensions)
4. Migrer les fonts (Google Fonts DM Sans / DM Mono via `next/font/google`)
5. Migrer `app/globals.css` avec les keyframes (`blink`, `spin`, `barfill`, `risein`, `pop`, `scan`) et utilitaires (`bg-grid`, `noise`, `scanline`, `tabular`)
6. Créer `lib/types.ts`, `lib/url-normalize.ts`, `lib/verdict-mock.ts`, `lib/usage-cookie.ts`
7. Créer les composants migrés : `TopBar`, `Hero`, `Loader`, `ScoreRing`, `Result`
8. Créer les nouveaux composants : `EmailGate`, `LimitReached`
9. Créer `app/page.tsx` avec la machine à états (`phase`, `url`, `verdict`, `usage`)
10. Créer `app/api/analyze/route.ts` (stub : valide URL → appelle `verdict-mock` → `setTimeout(3000)` → retour JSON)
11. Créer `app/api/lead/route.ts` (stub : valide email regex → 200 OK)
12. Créer `.env.example` avec placeholders : `FIRECRAWL_API_KEY=`, `ANTHROPIC_API_KEY=`, `NOTION_TOKEN=`, `NOTION_DB_ID=`, `MAX_ANALYSES_PER_DAY=100`
13. Test local `npm run dev` : flow complet 1re + 2e analyse + limite + reset cookie via devtools
14. `git init` + push GitHub + connexion Vercel + déploiement
15. Vérification du déploiement en prod (mobile + desktop, devtools Network)

## Hors scope (pas ce soir)

- Vraie intégration Firecrawl
- Vraie intégration Anthropic
- Vraie intégration Notion (le MCP est dispo, on l'utilisera demain)
- Rate limit serveur Vercel
- Tests automatisés (Playwright / Vitest) — à reprendre si volume justifie
- Le PDF "checklist 7 signaux" — supprimé du scope définitivement
- SEO de la landing (meta, OG image, sitemap) — secondaire, à voir après MVP

## Critères de succès du build de ce soir

- L'app tourne en local avec `npm run dev`
- Le flow complet est démontrable : `idle → loading → result → click "autre" → emailGate → email → idle → loading → result → click "autre" → limitReached`
- Le rendu est **identique** à 99% au HTML existant (seul le bloc lead magnet PDF est remplacé)
- Le déploiement Vercel est en ligne et accessible publiquement
- `.env.example` documente toutes les clés à fournir demain
