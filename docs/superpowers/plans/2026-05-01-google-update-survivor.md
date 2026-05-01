# Google Update Survivor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrer le HTML monobloc existant en projet Next.js déployable sur Vercel, avec endpoints API en stub (vraies intégrations Firecrawl/Anthropic/Notion repoussées au lendemain).

**Architecture:** Next.js 15 App Router + TypeScript + Tailwind v3. Le rendu visuel doit être identique à 99% au HTML source (seul le bloc `LeadMagnet` PDF est remplacé par un nouveau flow `EmailGate` qui se déclenche à la 2e analyse). Cookie navigateur `gus_usage` pour tracker l'utilisation. Stubs `/api/analyze` et `/api/lead` aujourd'hui — ils appellent le mock existant et valident l'email — branchements réels demain.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v3, React 18, `next/font`, native `cookies-next` ou helpers maison.

**Reference:** Le HTML source (déplacé en `docs/reference/original-design.html`) sert de référence de rendu et de source pour les sections de landing qui sont migrées telles quelles.

---

## Phase 1 — Setup projet

### Task 1: Préparer le dossier et déplacer le HTML existant

**Files:**
- Move: `Google Update Survivor.html` → `docs/reference/original-design.html`

- [ ] **Step 1: Créer le dossier `docs/reference/`**

```bash
mkdir -p "/Users/lavic/Desktop/Google survivor tool/docs/reference"
```

- [ ] **Step 2: Déplacer le HTML**

```bash
cd "/Users/lavic/Desktop/Google survivor tool"
mv "Google Update Survivor.html" "docs/reference/original-design.html"
```

- [ ] **Step 3: Vérifier que le dossier racine ne contient plus que `docs/`**

```bash
ls -la "/Users/lavic/Desktop/Google survivor tool"
```
Expected: seul `docs/` (et `.` `..`) doit être visible. Si quoi que ce soit d'autre traîne (`.DS_Store` est OK), supprimer pour que `create-next-app .` ne refuse pas.

---

### Task 2: Initialiser le projet Next.js

**Files:**
- Create: arborescence Next.js complète à la racine

- [ ] **Step 1: Lancer create-next-app dans le dossier courant**

```bash
cd "/Users/lavic/Desktop/Google survivor tool"
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --eslint --no-turbopack
```

Quand le prompt demande "Would you like your code inside a `src/` directory?", répondre **No** (déjà passé en flag mais peut redemander).

- [ ] **Step 2: Vérifier que le projet build**

```bash
npm run build
```
Expected: build réussi, dossier `.next/` créé.

- [ ] **Step 3: Lancer le dev server pour vérifier la page Next.js par défaut**

```bash
npm run dev
```
Expected: serveur sur `http://localhost:3000`, page d'accueil Next.js par défaut visible. Stopper avec Ctrl+C.

- [ ] **Step 4: Init git + premier commit**

```bash
git init
git add .
git commit -m "chore: bootstrap next.js project"
```

- [ ] **Step 5: Connecter au repo GitHub existant**

```bash
git remote add origin https://github.com/Lavic69/google-maj-tool.git
git branch -M main
git push -u origin main
```

---

### Task 3: Configurer Tailwind avec la palette custom du HTML

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Remplacer le contenu de `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F1115",
        ink2: "#15181F",
        ink3: "#1C2029",
        line: "#252A36",
        line2: "#2F3542",
        accent: "#2563EB",
        accent2: "#3B82F6",
        ok: "#10B981",
        warn: "#F59E0B",
        bad: "#EF4444",
        mute: "#8A93A6",
        mute2: "#5A6273",
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Commit**

```bash
git add tailwind.config.ts
git commit -m "chore: configure tailwind palette and fonts"
```

---

## Phase 2 — Foundations (lib + types)

### Task 4: Types TypeScript partagés

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Créer le fichier**

```ts
export type Tier = 'safe' | 'risk' | 'hit';

export type AxisKey = 'eeat' | 'helpful' | 'edito' | 'risk';

export interface Axis {
  key: AxisKey;
  label: string;
  hint: string;
  score: number;
}

export interface Fix {
  t: string;
  d: string;
}

export interface Verdict {
  score: number;
  tier: Tier;
  axes: Axis[];
  fixes: Fix[];
  explain: string[];
}

export interface UsageCookie {
  count: 0 | 1 | 2;
  emailProvided: boolean;
  domains: string[];
}

export interface AnalyzeRequest {
  url: string;
}

export interface AnalyzeResponse extends Verdict {}

export interface LeadRequest {
  email: string;
  domain: string;
  score: number;
}

export interface LeadResponse {
  ok: true;
}
```

- [ ] **Step 2: Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: shared TS types for verdict and cookie"
```

---

### Task 5: URL normalize helper

**Files:**
- Create: `lib/url-normalize.ts`

- [ ] **Step 1: Créer le fichier**

```ts
export function normalizeUrl(raw: string): URL | null {
  let s = (raw || '').trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  try {
    const u = new URL(s);
    if (!u.hostname.includes('.')) return null;
    return u;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Vérifier la compilation**

```bash
npx tsc --noEmit
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add lib/url-normalize.ts
git commit -m "feat: url normalization helper"
```

---

### Task 6: Verdict mock (pool de fixes + buildVerdict)

**Files:**
- Create: `lib/verdict-mock.ts`

- [ ] **Step 1: Créer le fichier**

```ts
import type { Axis, AxisKey, Fix, Tier, Verdict } from './types';

const FIX_POOL: Fix[] = [
  { t: "Réécris tes 5 pages les plus visitées",        d: "Vire le ton générique. Ajoute ton vécu, des chiffres, des exemples concrets." },
  { t: "Mets un vrai auteur sur chaque article",        d: "Nom, photo, bio, LinkedIn. Google veut savoir qui parle. Pas “Team Editorial”." },
  { t: "Supprime ou fusionne le thin content",          d: "Toute page sous 400 mots qui ne convertit pas : poubelle ou regroupée." },
  { t: "Retravaille les pages générées par IA",         d: "Ajoute un angle perso, une opinion, un cas client. L’IA brute ne passe plus." },
  { t: "Profondeur > volume sur tes pages piliers",     d: "Mieux vaut 8 articles excellents que 40 moyens. Coupe le gras." },
  { t: "Ajoute des preuves : screenshots, captures",    d: "Montre que tu as VRAIMENT fait le truc dont tu parles. E-E-A-T = expérience." },
  { t: "Date et update tes vieux articles",             d: "Mets-les à jour pour 2026, ajoute du neuf, change la date publiquement." },
  { t: "Une page = une intention claire",               d: "Si la page essaie de plaire à 3 audiences, elle plaît à zéro." },
  { t: "Renforce les pages “À propos” et “Contact”", d: "Adresse, équipe, mentions légales. Les sites flous se font dégommer." },
  { t: "Coupe les CTAs agressifs en haut de page",      d: "Pop-ups, bannières, “téléchargez maintenant” x4 : pénalisé." },
  { t: "Maillage interne propre vers tes piliers",      d: "Chaque article doit lier au moins 2 pages clés du site." },
  { t: "Vire les articles “top 10 outils” génériques", d: "Recopiés partout. Aucune valeur. Risque rouge sur le prochain update." },
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
    return { ...a, score: v };
  });

  const idxs = new Set<number>();
  while (idxs.size < 3) idxs.add(Math.floor(rand() * FIX_POOL.length));
  const fixes = [...idxs].map((i) => FIX_POOL[i]);

  return { score, tier, axes, fixes, explain: EXPLAIN_BY[tier] };
}
```

- [ ] **Step 2: Vérifier la compilation**

```bash
npx tsc --noEmit
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add lib/verdict-mock.ts
git commit -m "feat: verdict mock with seeded PRNG"
```

---

### Task 7: Cookie d'usage (lecture/écriture côté client)

**Files:**
- Create: `lib/usage-cookie.ts`

- [ ] **Step 1: Créer le fichier**

```ts
import type { UsageCookie } from './types';

const COOKIE_NAME = 'gus_usage';
const MAX_AGE_DAYS = 90;

const DEFAULT_USAGE: UsageCookie = {
  count: 0,
  emailProvided: false,
  domains: [],
};

export function readUsage(): UsageCookie {
  if (typeof document === 'undefined') return DEFAULT_USAGE;
  const match = document.cookie
    .split('; ')
    .find((c) => c.startsWith(COOKIE_NAME + '='));
  if (!match) return DEFAULT_USAGE;
  try {
    const raw = decodeURIComponent(match.split('=')[1]);
    const parsed = JSON.parse(raw) as UsageCookie;
    if (typeof parsed.count !== 'number') return DEFAULT_USAGE;
    return {
      count: (parsed.count > 2 ? 2 : parsed.count) as 0 | 1 | 2,
      emailProvided: !!parsed.emailProvided,
      domains: Array.isArray(parsed.domains) ? parsed.domains : [],
    };
  } catch {
    return DEFAULT_USAGE;
  }
}

export function writeUsage(usage: UsageCookie): void {
  if (typeof document === 'undefined') return;
  const value = encodeURIComponent(JSON.stringify(usage));
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function recordAnalysis(domain: string): UsageCookie {
  const current = readUsage();
  const nextCount = Math.min(current.count + 1, 2) as 0 | 1 | 2;
  const next: UsageCookie = {
    count: nextCount,
    emailProvided: current.emailProvided,
    domains: [...current.domains, domain],
  };
  writeUsage(next);
  return next;
}

export function markEmailProvided(): UsageCookie {
  const current = readUsage();
  const next: UsageCookie = { ...current, emailProvided: true };
  writeUsage(next);
  return next;
}

export function resetUsage(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}
```

- [ ] **Step 2: Vérifier la compilation**

```bash
npx tsc --noEmit
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add lib/usage-cookie.ts
git commit -m "feat: client-side usage cookie helpers"
```

---

## Phase 3 — Layout, fonts et styles globaux

### Task 8: Layout root avec fonts DM Sans / DM Mono

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Remplacer le contenu de `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Google Update Survivor — Ton site survivra-t-il au prochain update ?",
  description: "30 secondes. 4 critères. Un verdict honnête sur ton site face au prochain core update Google.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body className="min-h-screen bg-ink text-white antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Vérifier la compilation**

```bash
npx tsc --noEmit
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: root layout with DM Sans/Mono fonts"
```

---

### Task 9: Styles globaux (animations + utilitaires custom)

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Remplacer le contenu de `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body {
  background: #0F1115;
}

body {
  color: #fff;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  letter-spacing: -0.005em;
}

.bg-grid {
  background-image:
    radial-gradient(1200px 600px at 50% -10%, rgba(37, 99, 235, 0.18), transparent 60%),
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: auto, 44px 44px, 44px 44px;
  background-position: 0 0, 0 0, 0 0;
}

.noise::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  mix-blend-mode: overlay;
  opacity: 0.5;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
}
.blink { animation: blink 1.1s ease-in-out infinite; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.9s linear infinite; }

@keyframes barfill { from { width: 0%; } }
.barfill { animation: barfill linear forwards; }

@keyframes risein {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.risein { animation: risein 0.5s cubic-bezier(.2, .7, .2, 1) both; }

@keyframes pop {
  0%   { transform: scale(.92); opacity: 0; }
  60%  { transform: scale(1.02); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.pop { animation: pop 0.6s cubic-bezier(.2, .8, .2, 1) both; }

@keyframes scan {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}
.scanline {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: inherit;
}
.scanline::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(180deg, transparent, rgba(37, 99, 235, 0.10), transparent);
  animation: scan 2.4s ease-in-out infinite;
}

.tabular { font-variant-numeric: tabular-nums; }

.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.35);
  border-color: #2563EB;
}

::selection {
  background: rgba(37, 99, 235, 0.4);
  color: #fff;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.ulink {
  background-image: linear-gradient(currentColor, currentColor);
  background-size: 100% 1px;
  background-repeat: no-repeat;
  background-position: 0 100%;
}
```

- [ ] **Step 2: Vérifier la compilation**

```bash
npm run build
```
Expected: build réussi.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: global CSS with custom animations and utilities"
```

---

## Phase 4 — Composants atomiques (Icons + simple components)

### Task 10: Icons partagés

**Files:**
- Create: `components/Icons.tsx`

- [ ] **Step 1: Créer le fichier**

```tsx
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export const Check = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const Spin = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...p}>
    <path d="M21 12a9 9 0 1 1-3.5-7.1" opacity=".9" />
  </svg>
);

export const Arrow = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const Search = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const Mail = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

export const Globe = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </svg>
);

export const Spark = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
  </svg>
);

export const Restart = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M21 12a9 9 0 1 1-3-6.7" />
    <path d="M21 4v5h-5" />
  </svg>
);
```

- [ ] **Step 2: Vérifier la compilation**

```bash
npx tsc --noEmit
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add components/Icons.tsx
git commit -m "feat: shared icon components"
```

---

### Task 11: TopBar

**Files:**
- Create: `components/TopBar.tsx`

- [ ] **Step 1: Créer le fichier**

```tsx
export function TopBar() {
  return (
    <header className="relative z-20 border-b border-line/70">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative h-7 w-7 rounded-md bg-accent grid place-items-center shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]">
            <span className="font-mono text-[11px] font-bold tracking-tight">GU</span>
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold tracking-tight">Google Update Survivor</div>
            <div className="text-[10.5px] font-mono text-mute -mt-0.5">v1.0 · build 2026.05</div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[12px] text-mute">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-ok blink" />
            <span className="font-mono">live · check-engine OK</span>
          </span>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/TopBar.tsx
git commit -m "feat: TopBar component"
```

---

### Task 12: Footer

**Files:**
- Create: `components/Footer.tsx`

- [ ] **Step 1: Créer le fichier**

```tsx
export function Footer() {
  return (
    <footer className="border-t border-line/70">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
        <div className="font-mono text-[11.5px] text-mute">
          Build by <span className="text-white">MV Agency</span> ·{' '}
          <a href="https://mvagency.ai" className="ulink hover:text-white">mvagency.ai</a>
        </div>
        <div className="font-mono text-[11.5px] text-mute hidden sm:block">© 2026 · made for survivors</div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Footer.tsx
git commit -m "feat: Footer component"
```

---

### Task 13: Hero (formulaire URL)

**Files:**
- Create: `components/Hero.tsx`

- [ ] **Step 1: Créer le fichier**

```tsx
'use client';

import { useRef, useState } from 'react';
import { AXES } from '@/lib/verdict-mock';
import { normalizeUrl } from '@/lib/url-normalize';
import { Arrow, Globe, Spark } from './Icons';

interface HeroProps {
  onSubmit: (u: URL) => void;
  error: string | null;
  setError: (e: string | null) => void;
}

export function Hero({ onSubmit, error, setError }: HeroProps) {
  const [val, setVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault?.();
    const u = normalizeUrl(val);
    if (!u) {
      setError("Hmm, cette URL n’a pas l’air bonne. Essaie : tonsite.com");
      return;
    }
    setError(null);
    onSubmit(u);
  };

  return (
    <section className="relative bg-grid noise overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 pt-14 sm:pt-24 pb-16 sm:pb-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-ink2/60 backdrop-blur px-3 py-1 text-[11.5px] font-mono text-mute">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span>diagnostic · sans inscription · 30s</span>
        </div>

        <h1 className="mt-5 sm:mt-7 text-[34px] leading-[1.05] sm:text-[64px] sm:leading-[1.02] font-semibold tracking-[-0.02em] max-w-[18ch]" style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
          Ton site survivra-t-il au prochain <span className="text-accent">Google Update</span> ?
        </h1>

        <p className="mt-4 sm:mt-6 text-[16px] sm:text-[20px] text-mute max-w-[44ch]">
          30 secondes. 4 critères. Un verdict honnête.
        </p>

        <form id="diag-form" onSubmit={submit} className="mt-7 sm:mt-10 max-w-2xl">
          <div className={'group relative flex flex-col sm:flex-row items-stretch gap-2 rounded-2xl border ' + (error ? 'border-bad/60' : 'border-line2') + ' bg-ink2/80 backdrop-blur p-2'}>
            <div className="flex items-center gap-2 px-3 sm:px-3 sm:flex-1">
              <Globe className="h-4 w-4 text-mute shrink-0" />
              <input
                ref={inputRef}
                value={val}
                onChange={(e) => {
                  setVal(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="tonsite.com"
                inputMode="url"
                autoComplete="url"
                spellCheck={false}
                className="focus-ring w-full bg-transparent py-3 text-[16px] sm:text-[17px] placeholder:text-mute2 text-white outline-none"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-accent hover:bg-accent2 active:scale-[0.99] transition px-5 py-3.5 sm:py-3 font-semibold text-[15px] tracking-tight"
            >
              Analyser mon site
              <Arrow className="h-4 w-4" />
            </button>
          </div>
          {error && <div className="mt-2 text-[13px] text-bad font-mono">{error}</div>}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] font-mono text-mute">
            <span className="inline-flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-mute" /> aucun login</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-mute" /> on ne stocke pas l’URL</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-mute" /> 100% gratuit</span>
          </div>
        </form>

        <div className="mt-12 sm:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {AXES.map((a, i) => (
            <div key={a.key} className="rounded-xl border border-line bg-ink2/60 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-mute">0{i + 1}</span>
                <Spark className="h-3.5 w-3.5 text-mute2" />
              </div>
              <div className="mt-2 text-[14.5px] font-semibold tracking-tight">{a.label}</div>
              <div className="mt-1 text-[12.5px] text-mute leading-snug">{a.hint}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Note: les `’` sont des apostrophes typographiques. En les laissant comme escape Unicode dans le code, on évite les problèmes d'encoding.

- [ ] **Step 2: Vérifier la compilation**

```bash
npx tsc --noEmit
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add components/Hero.tsx
git commit -m "feat: Hero with URL form"
```

---

### Task 14: ScoreRing (anneau animé)

**Files:**
- Create: `components/ScoreRing.tsx`

- [ ] **Step 1: Créer le fichier**

```tsx
'use client';

import { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;
  color: string;
}

export function ScoreRing({ score, color }: ScoreRingProps) {
  const R = 56;
  const C = 2 * Math.PI * R;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let raf: number;
    let start: number | undefined;
    const dur = 900;
    const step = (t: number) => {
      if (start === undefined) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(score * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const offset = C - (shown / 100) * C;

  return (
    <div className="relative h-[140px] w-[140px]">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle cx="70" cy="70" r={R} stroke="#252A36" strokeWidth="10" fill="none" />
        <circle
          cx="70"
          cy="70"
          r={R}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 60ms linear' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="tabular text-[40px] leading-none font-semibold tracking-tight">{shown}</div>
          <div className="font-mono text-[10.5px] text-mute mt-1">/ 100</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ScoreRing.tsx
git commit -m "feat: ScoreRing animated component"
```

---

## Phase 5 — Composants complexes

### Task 15: Loader (animation 4 checks)

**Files:**
- Create: `components/Loader.tsx`

- [ ] **Step 1: Créer le fichier**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { AXES } from '@/lib/verdict-mock';
import { Check, Spin } from './Icons';

interface LoaderProps {
  url: URL;
  onDone: () => void;
}

const STEP_DURATIONS = [950, 900, 850, 950]; // ms par étape ~ 3.6s total

export function Loader({ url, onDone }: LoaderProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    let acc = 200;
    const timers: ReturnType<typeof setTimeout>[] = [];
    AXES.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setStepIdx(i + 1);
          setDone((d) => [...d, i]);
        }, acc + STEP_DURATIONS[i])
      );
      acc += STEP_DURATIONS[i];
    });
    timers.push(
      setTimeout(() => {
        if (!cancelled) onDone();
      }, acc + 350)
    );
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="relative">
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-14 sm:py-24">
        <div className="relative rounded-2xl border border-line2 bg-ink2/70 overflow-hidden">
          <div className="scanline" />
          <div className="px-5 sm:px-8 py-6 sm:py-8 border-b border-line">
            <div className="flex items-center justify-between gap-3">
              <div className="font-mono text-[11.5px] text-mute">running diagnostic</div>
              <div className="font-mono text-[11.5px] text-mute truncate max-w-[60%]">→ {url.hostname}</div>
            </div>
            <div className="mt-3 flex items-baseline gap-3">
              <div className="text-[22px] sm:text-[26px] font-semibold tracking-tight">On scanne ton site…</div>
            </div>
            <div className="mt-1 text-[13.5px] text-mute">Ça prend moins de 30 secondes. Promis.</div>
          </div>

          <ul className="divide-y divide-line">
            {AXES.map((s, i) => {
              const isDone = done.includes(i);
              const isActive = stepIdx === i && !isDone;
              const isPending = i > stepIdx;
              return (
                <li key={s.key} className="px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-4">
                  <div className={'h-7 w-7 rounded-full grid place-items-center shrink-0 ' +
                    (isDone ? 'bg-ok/15 text-ok' :
                     isActive ? 'bg-accent/15 text-accent' :
                                'bg-ink3 text-mute2')}>
                    {isDone && <Check className="h-4 w-4" />}
                    {isActive && <Spin className="h-4 w-4 spin" />}
                    {isPending && <span className="font-mono text-[11px]">0{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={'text-[15.5px] font-semibold tracking-tight ' + (isPending ? 'text-mute2' : 'text-white')}>
                      {s.label}
                    </div>
                    <div className={'text-[12.5px] ' + (isPending ? 'text-mute2' : 'text-mute')}>{s.hint}</div>
                    <div className="mt-2 h-[3px] rounded-full bg-line overflow-hidden">
                      <div
                        className={isActive ? 'barfill h-full bg-accent' : 'h-full'}
                        style={{
                          width: isDone ? '100%' : (isActive ? undefined : '0%'),
                          background: isDone ? '#10B981' : undefined,
                          animationDuration: isActive ? STEP_DURATIONS[i] + 'ms' : undefined,
                        }}
                      />
                    </div>
                  </div>
                  <div className={'font-mono text-[11.5px] ' + (isDone ? 'text-ok' : isActive ? 'text-accent' : 'text-mute2')}>
                    {isDone ? 'ok' : isActive ? '…' : '—'}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="px-5 sm:px-8 py-4 border-t border-line flex items-center justify-between">
            <div className="font-mono text-[11.5px] text-mute">étape {Math.min(stepIdx + 1, AXES.length)} / {AXES.length}</div>
            <div className="font-mono text-[11.5px] text-mute">≈ {Math.max(0, Math.ceil(STEP_DURATIONS.slice(stepIdx).reduce((a, b) => a + b, 0) / 1000))}s restantes</div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Loader.tsx
git commit -m "feat: Loader with 4-step animation"
```

---

### Task 16: Result (verdict + axes + fixes + restart)

**Files:**
- Create: `components/Result.tsx`

Note: ce composant **n'inclut plus** le bloc `LeadMagnet` (supprimé). Le bouton "tester une autre URL" déclenche `onRestart`, qui sera connecté à la logique de cookie dans `page.tsx`.

- [ ] **Step 1: Créer le fichier**

```tsx
'use client';

import { TIER_META } from '@/lib/verdict-mock';
import type { Verdict } from '@/lib/types';
import { ScoreRing } from './ScoreRing';
import { Restart } from './Icons';

interface ResultProps {
  url: URL;
  verdict: Verdict;
  onRestart: () => void;
}

export function Result({ url, verdict, onRestart }: ResultProps) {
  const meta = TIER_META[verdict.tier];

  return (
    <section className="relative">
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-10 sm:py-16">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11.5px] text-mute">
          <span>verdict pour</span>
          <span className="text-white truncate max-w-[60vw]">
            {url.hostname}
            {url.pathname !== '/' ? url.pathname : ''}
          </span>
          <span>·</span>
          <span>scanné en 3.6s</span>
        </div>

        <div className="pop mt-3 rounded-2xl border bg-ink2/70 overflow-hidden" style={{ borderColor: meta.ring }}>
          <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-6 sm:pb-7" style={{ background: `linear-gradient(180deg, ${meta.bg}, transparent 80%)` }}>
            <div className="flex items-start sm:items-center gap-5 sm:gap-7 flex-col sm:flex-row">
              <ScoreRing score={verdict.score} color={meta.color} />
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-mono" style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.ring}` }}>
                  <span>{meta.emoji}</span>
                  <span className="font-semibold tracking-wide">{meta.label}</span>
                </div>
                <h2 className="mt-3 text-[26px] sm:text-[34px] leading-[1.08] font-semibold tracking-[-0.01em]" style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
                  {meta.short}
                </h2>
                <div className="mt-3 space-y-1.5 text-[14.5px] sm:text-[15.5px] text-white/85 leading-snug">
                  {verdict.explain.map((line, i) => (
                    <p key={i} className="risein" style={{ animationDelay: 120 + i * 90 + 'ms' }}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border-t" style={{ borderColor: '#252A36' }}>
            {verdict.axes.map((a) => {
              const c = a.score >= 75 ? '#10B981' : a.score >= 50 ? '#F59E0B' : '#EF4444';
              return (
                <div key={a.key} className="bg-ink2 p-4">
                  <div className="font-mono text-[10.5px] text-mute uppercase tracking-wider">{a.label}</div>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className="tabular text-[22px] font-semibold" style={{ color: c }}>{a.score}</span>
                    <span className="font-mono text-[11px] text-mute">/100</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-ink3 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: a.score + '%', background: c }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 sm:mt-10">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="font-mono text-[11.5px] text-mute uppercase tracking-wider">priorités</div>
              <h3 className="mt-1 text-[22px] sm:text-[26px] font-semibold tracking-tight">Top 3 fixes</h3>
            </div>
            <div className="font-mono text-[11.5px] text-mute hidden sm:block">à faire avant le prochain update</div>
          </div>

          <ol className="mt-4 sm:mt-5 space-y-2.5">
            {verdict.fixes.map((f, i) => (
              <li key={i} className="risein rounded-xl border border-line bg-ink2/70 p-4 sm:p-5 flex gap-4" style={{ animationDelay: 260 + i * 90 + 'ms' }}>
                <div className="shrink-0 h-8 w-8 rounded-lg bg-accent/15 text-accent grid place-items-center font-mono font-semibold">
                  0{i + 1}
                </div>
                <div className="min-w-0">
                  <div className="text-[15.5px] font-semibold tracking-tight">{f.t}</div>
                  <div className="mt-0.5 text-[13.5px] text-mute leading-snug">{f.d}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex items-center justify-center">
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-full border border-line2 bg-ink2/70 hover:bg-ink3 transition px-4 py-2 text-[13px] font-mono text-mute hover:text-white"
          >
            <Restart className="h-3.5 w-3.5" /> Analyser un autre site
          </button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Result.tsx
git commit -m "feat: Result component (no more lead magnet PDF block)"
```

---

## Phase 6 — Sections de landing (migration directe)

### Task 17: Migrer toutes les sections éducatives + helper SectionLabel

Le HTML source contient 8 sections éducatives + un Footer + un helper `SectionLabel`. Elles sont **migrées telles quelles** depuis `docs/reference/original-design.html` (le code JSX est valide JSX, il faut juste retirer les attributs `data-screen-label`, ajouter `'use client'` quand le composant utilise `useState`, et corriger les apostrophes typographiques en `’` dans les chaînes).

**Files:**
- Create: `components/SectionLabel.tsx` (helper, depuis lignes 685-693 du HTML source)
- Create: `components/landing/CarnageSection.tsx` (depuis lignes 695-760)
- Create: `components/landing/ExplainerSection.tsx` (depuis lignes 762-824)
- Create: `components/landing/ReasonsSection.tsx` (depuis lignes 826-893)
- Create: `components/landing/ToolExplainSection.tsx` (depuis lignes 895-958)
- Create: `components/landing/HowItWorksSection.tsx` (depuis lignes 960-994)
- Create: `components/landing/ForWhoSection.tsx` (depuis lignes 996-1027)
- Create: `components/landing/FAQSection.tsx` (depuis lignes 1029-1081, **inclut FAQItem inline** ; nécessite `'use client'`)
- Create: `components/landing/FinalCTA.tsx` (depuis lignes 1083-1107)

**Règles de migration pour CHAQUE fichier :**

1. Ouvrir `docs/reference/original-design.html` aux lignes indiquées
2. Copier le bloc `function ComponentName() { ... }` complet
3. Convertir en `export function ComponentName()`
4. Si le composant utilise `useState`, `useEffect`, etc. : ajouter `'use client';` en haut + l'import React approprié
5. Retirer l'attribut `data-screen-label="..."` partout
6. Pour les composants qui contiennent des appels à `Icon.X` : remplacer par un import nommé depuis `'@/components/Icons'` (ex : `<Icon.Arrow ... />` → `<Arrow ... />`)
7. Pour les composants qui contiennent un appel à `scrollToForm()` : créer une fonction locale dans le fichier :
   ```tsx
   function scrollToForm() {
     const el = document.getElementById('diag-form');
     if (!el) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
     const y = el.getBoundingClientRect().top + window.scrollY - 80;
     window.scrollTo({ top: y, behavior: 'smooth' });
     setTimeout(() => { const i = el.querySelector('input'); if (i instanceof HTMLInputElement) i.focus({ preventScroll: true }); }, 500);
   }
   ```
   Composants concernés : `ToolExplainSection`, `FinalCTA`.
8. Toutes les apostrophes typographiques `’` (notamment dans les chaînes JSX) → laisser telles quelles ; pour les attributs JSX qui contiennent des accolades de chaîne, échapper avec `’`.
9. Importer `SectionLabel` depuis `@/components/SectionLabel` quand utilisé.

**Exemple : `components/SectionLabel.tsx`**

```tsx
interface SectionLabelProps {
  n: string;
  children: React.ReactNode;
}

export function SectionLabel({ n, children }: SectionLabelProps) {
  return (
    <div className="inline-flex items-center gap-2 font-mono text-[11.5px] text-mute uppercase tracking-[0.14em]">
      <span className="text-accent">§ {n}</span>
      <span className="h-px w-8 bg-line2" />
      <span>{children}</span>
    </div>
  );
}
```

**Exemple : `components/landing/FAQSection.tsx`** (contient FAQItem qui utilise `useState`, donc `'use client'`)

```tsx
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
```

Appliquer le même pattern aux autres sections en suivant les règles de migration.

- [ ] **Step 1: Créer `components/SectionLabel.tsx`** (code ci-dessus)

- [ ] **Step 2: Créer `components/landing/CarnageSection.tsx`** depuis HTML lignes 695-760, en appliquant les règles 1-9

- [ ] **Step 3: Créer `components/landing/ExplainerSection.tsx`** depuis HTML lignes 762-824

- [ ] **Step 4: Créer `components/landing/ReasonsSection.tsx`** depuis HTML lignes 826-893

- [ ] **Step 5: Créer `components/landing/ToolExplainSection.tsx`** depuis HTML lignes 895-958 (use client + scrollToForm + import Arrow, Check)

- [ ] **Step 6: Créer `components/landing/HowItWorksSection.tsx`** depuis HTML lignes 960-994 (import Arrow)

- [ ] **Step 7: Créer `components/landing/ForWhoSection.tsx`** depuis HTML lignes 996-1027

- [ ] **Step 8: Créer `components/landing/FAQSection.tsx`** (code ci-dessus complet)

- [ ] **Step 9: Créer `components/landing/FinalCTA.tsx`** depuis HTML lignes 1083-1107 (use client + scrollToForm + import Arrow)

- [ ] **Step 10: Vérifier la compilation**

```bash
npx tsc --noEmit
```
Expected: pas d'erreur. Si erreurs sur `textWrap`, vérifier le cast `as React.CSSProperties['textWrap']` partout où il est utilisé.

- [ ] **Step 11: Vérifier le build**

```bash
npm run build
```
Expected: build réussi.

- [ ] **Step 12: Commit**

```bash
git add components/SectionLabel.tsx components/landing/
git commit -m "feat: migrate landing sections from original HTML"
```

---

## Phase 7 — Nouveaux composants

### Task 18: EmailGate (capture email pour 2e analyse)

**Files:**
- Create: `components/EmailGate.tsx`

- [ ] **Step 1: Créer le fichier**

```tsx
'use client';

import { useState } from 'react';
import { Arrow, Check, Mail, Spin } from './Icons';

interface EmailGateProps {
  domain: string;
  score: number;
  onSuccess: () => void;
  onCancel: () => void;
}

type Phase = 'idle' | 'sending' | 'done' | 'error';

export function EmailGate({ domain, score, onSuccess, onCancel }: EmailGateProps) {
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) {
      setErr("Ton email a l’air bizarre. Re-tente.");
      return;
    }
    setErr(null);
    setPhase('sending');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), domain, score }),
      });
      if (!res.ok) throw new Error('lead failed');
      setPhase('done');
      setTimeout(onSuccess, 800);
    } catch {
      setPhase('error');
      setErr("Une erreur est survenue. Réessaie dans 1 minute.");
    }
  };

  return (
    <section className="relative">
      <div className="mx-auto max-w-2xl px-5 sm:px-8 py-14 sm:py-20">
        <div className="relative overflow-hidden rounded-2xl border border-accent/40" style={{ background: 'linear-gradient(180deg, rgba(37,99,235,0.18), rgba(37,99,235,0.06))' }}>
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(59,130,246,0.45), transparent)' }} />
          <div className="relative px-5 sm:px-8 py-8 sm:py-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 border border-accent/40 px-3 py-1 text-[11.5px] font-mono">
              📩 1 analyse de plus
            </div>

            <h2 className="mt-3 text-[24px] sm:text-[30px] font-semibold tracking-tight max-w-[28ch]" style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
              Tu veux analyser un autre site ? Donne-moi ton email.
            </h2>
            <p className="mt-2 text-[14.5px] text-white/75 max-w-[44ch]">
              On te débloque une analyse de plus. Pas de spam. Pas de séquence à 12 mails.
            </p>

            {phase !== 'done' ? (
              <form onSubmit={submit} className="mt-6">
                <div className={'flex flex-col sm:flex-row items-stretch gap-2 rounded-xl border ' + (err ? 'border-bad/60' : 'border-accent/50') + ' bg-ink/60 p-2'}>
                  <div className="flex items-center gap-2 px-3 sm:flex-1">
                    <Mail className="h-4 w-4 text-mute shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (err) setErr(null);
                      }}
                      placeholder="ton@email.com"
                      className="focus-ring w-full bg-transparent py-3 text-[15.5px] placeholder:text-mute2 text-white outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={phase === 'sending'}
                    className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-accent hover:bg-accent2 active:scale-[0.99] disabled:opacity-70 transition px-4 py-3 sm:py-2.5 font-semibold text-[14.5px]"
                  >
                    {phase === 'sending' ? (
                      <><Spin className="h-4 w-4 spin" /> envoi…</>
                    ) : (
                      <>Débloquer une analyse <Arrow className="h-4 w-4" /></>
                    )}
                  </button>
                </div>
                {err && <div className="mt-2 font-mono text-[12.5px] text-bad">{err}</div>}
              </form>
            ) : (
              <div className="mt-6 risein rounded-xl border border-ok/40 bg-ok/10 p-4 sm:p-5 flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-ok/20 text-ok grid place-items-center shrink-0">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[15.5px] font-semibold tracking-tight">C’est parti.</div>
                  <div className="mt-0.5 text-[13.5px] text-white/75">On te redirige…</div>
                </div>
              </div>
            )}

            <div className="mt-5">
              <button
                type="button"
                onClick={onCancel}
                className="text-[13px] font-mono text-mute hover:text-white underline-offset-4 hover:underline"
              >
                ← retour au verdict
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/EmailGate.tsx
git commit -m "feat: EmailGate component for second analysis"
```

---

### Task 19: LimitReached

**Files:**
- Create: `components/LimitReached.tsx`

- [ ] **Step 1: Créer le fichier**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/LimitReached.tsx
git commit -m "feat: LimitReached screen"
```

---

## Phase 8 — Orchestration (page.tsx)

### Task 20: page.tsx avec machine à états

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Remplacer le contenu**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { Hero } from '@/components/Hero';
import { Loader } from '@/components/Loader';
import { Result } from '@/components/Result';
import { EmailGate } from '@/components/EmailGate';
import { LimitReached } from '@/components/LimitReached';
import { Footer } from '@/components/Footer';
import { CarnageSection } from '@/components/landing/CarnageSection';
import { ExplainerSection } from '@/components/landing/ExplainerSection';
import { ReasonsSection } from '@/components/landing/ReasonsSection';
import { ToolExplainSection } from '@/components/landing/ToolExplainSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { ForWhoSection } from '@/components/landing/ForWhoSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { FinalCTA } from '@/components/landing/FinalCTA';
import type { UsageCookie, Verdict } from '@/lib/types';
import { readUsage, recordAnalysis, markEmailProvided } from '@/lib/usage-cookie';

type Phase = 'idle' | 'loading' | 'result' | 'emailGate' | 'limitReached';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [url, setUrl] = useState<URL | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageCookie>({ count: 0, emailProvided: false, domains: [] });

  useEffect(() => {
    setUsage(readUsage());
  }, []);

  const start = async (u: URL) => {
    setUrl(u);
    setPhase('loading');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: u.toString() }),
      });
      if (!res.ok) throw new Error('analyze failed');
      const data: Verdict = await res.json();
      setVerdict(data);
      const next = recordAnalysis(u.hostname);
      setUsage(next);
      setPhase('result');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch {
      setError("Le scan a échoué. Réessaie dans 1 minute.");
      setPhase('idle');
    }
  };

  const handleRestart = () => {
    const current = readUsage();
    if (current.count >= 2) {
      setPhase('limitReached');
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    if (current.count === 1 && !current.emailProvided) {
      setPhase('emailGate');
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    setUrl(null);
    setVerdict(null);
    setPhase('idle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEmailUnlock = () => {
    const next = markEmailProvided();
    setUsage(next);
    setUrl(null);
    setVerdict(null);
    setPhase('idle');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleEmailCancel = () => {
    if (verdict && url) {
      setPhase('result');
    } else {
      setPhase('idle');
    }
  };

  const handleBackHome = () => {
    setUrl(null);
    setVerdict(null);
    setPhase('idle');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1">
        {phase === 'idle' && (
          <>
            <Hero onSubmit={start} error={error} setError={setError} />
            <CarnageSection />
            <ExplainerSection />
            <ReasonsSection />
            <ToolExplainSection />
            <HowItWorksSection />
            <ForWhoSection />
            <FAQSection />
            <FinalCTA />
          </>
        )}
        {phase === 'loading' && url && <Loader url={url} onDone={() => { /* finish handled in start() */ }} />}
        {phase === 'result' && url && verdict && <Result url={url} verdict={verdict} onRestart={handleRestart} />}
        {phase === 'emailGate' && url && verdict && (
          <EmailGate
            domain={url.hostname}
            score={verdict.score}
            onSuccess={handleEmailUnlock}
            onCancel={handleEmailCancel}
          />
        )}
        {phase === 'limitReached' && <LimitReached onBackHome={handleBackHome} />}
      </main>
      <Footer />
    </div>
  );
}
```

**Note importante sur le timing :** dans le HTML d'origine, le `Loader` appelait `onDone` après ~3.6s pour déclencher la transition. Ici, on appelle `/api/analyze` en parallèle de l'animation du Loader. La transition se fait quand `start()` reçoit la réponse — pas quand l'animation se termine. C'est OK car l'animation dure ~3.6s et le stub a `setTimeout(3000)` côté serveur. **Si la réponse arrive avant la fin de l'animation**, on bascule directement sur `result` (pas de problème — le user voit juste l'animation moins longtemps). Si on veut absolument respecter l'animation complète, on peut wrapper avec `Promise.all([fetch, new Promise(r => setTimeout(r, 3500))])` plus tard.

- [ ] **Step 2: Vérifier la compilation**

```bash
npx tsc --noEmit
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: page.tsx state machine with cookie-based gating"
```

---

## Phase 9 — Endpoints API (stubs)

### Task 21: POST /api/analyze (stub)

**Files:**
- Create: `app/api/analyze/route.ts`

- [ ] **Step 1: Créer le fichier**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { buildVerdict } from '@/lib/verdict-mock';
import { normalizeUrl } from '@/lib/url-normalize';
import type { AnalyzeRequest } from '@/lib/types';

const SIMULATED_LATENCY_MS = 3000;

export async function POST(req: NextRequest) {
  let body: AnalyzeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const u = normalizeUrl(body.url || '');
  if (!u) {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 });
  }

  await new Promise((r) => setTimeout(r, SIMULATED_LATENCY_MS));

  const verdict = buildVerdict(u);
  return NextResponse.json(verdict);
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/analyze/route.ts
git commit -m "feat: stub /api/analyze (returns mock verdict)"
```

---

### Task 22: POST /api/lead (stub)

**Files:**
- Create: `app/api/lead/route.ts`

- [ ] **Step 1: Créer le fichier**

```ts
import { NextRequest, NextResponse } from 'next/server';
import type { LeadRequest } from '@/lib/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: LeadRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!body.email || !EMAIL_RE.test(body.email.trim())) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 });
  }

  // TODO demain : push dans Notion via MCP
  console.log('[lead stub]', { email: body.email, domain: body.domain, score: body.score });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/lead/route.ts
git commit -m "feat: stub /api/lead (validates email, logs payload)"
```

---

## Phase 10 — `.env.example` + tests + déploiement

### Task 23: `.env.example`

**Files:**
- Create: `.env.example`

- [ ] **Step 1: Créer le fichier**

```bash
# Firecrawl (scraping) — à brancher demain
FIRECRAWL_API_KEY=

# Anthropic Claude (analyse) — à brancher demain
ANTHROPIC_API_KEY=

# Notion (capture leads) — à brancher demain
NOTION_TOKEN=
NOTION_DB_ID=

# Cap global anti-abus
MAX_ANALYSES_PER_DAY=100
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "chore: env template for tomorrow's API integrations"
```

---

### Task 24: Test local du flow complet

**Files:** aucun changement, validation manuelle.

- [ ] **Step 1: Lancer le dev server**

```bash
npm run dev
```

- [ ] **Step 2: Tester le flow `idle → loading → result` (1re analyse)**

Ouvrir `http://localhost:3000`, entrer `tonsite.com` dans le champ URL, cliquer "Analyser mon site".
Expected:
- Loader visible avec les 4 checks animés
- Au bout de ~3s : verdict affiché avec score + axes + 3 fixes
- Bouton "Analyser un autre site" en bas

- [ ] **Step 3: Tester le flow `result → emailGate` (2e tentative)**

Cliquer sur "Analyser un autre site".
Expected: écran EmailGate visible avec champ email.

- [ ] **Step 4: Tester `emailGate → idle` (email entré)**

Entrer `test@example.com`, cliquer "Débloquer une analyse".
Expected: brève confirmation puis retour à l'accueil. Le cookie `gus_usage` doit avoir `emailProvided=true` et `count=1`.
Vérifier dans devtools Application → Cookies → `gus_usage`.

- [ ] **Step 5: Lancer la 2e analyse**

Entrer `autresite.com`, cliquer "Analyser mon site". Loader, verdict de la 2e analyse.
Vérifier dans devtools que le cookie `gus_usage` a `count=2` et `emailProvided=true`.

- [ ] **Step 6: Tester `limitReached` (3e tentative)**

Depuis le verdict de la 2e analyse, cliquer "Analyser un autre site".
Expected: écran "Tu as utilisé tes 2 analyses gratuites" (pas de retour à idle, parce que `count >= 2`).

- [ ] **Step 7: Tester reset cookie**

Dans devtools console :
```js
document.cookie = 'gus_usage=; Path=/; Max-Age=0';
```
Recharger la page.
Expected: comportement remis à zéro.

- [ ] **Step 8: Tester sur mobile (resize devtools à 375px)**

Vérifier que toutes les sections sont lisibles et que les boutons sont tappables.

- [ ] **Step 9: Tester l'erreur réseau**

Dans devtools Network, throttling = "Offline", tenter une analyse.
Expected: message "Le scan a échoué. Réessaie dans 1 minute." en rouge sous le formulaire.

---

### Task 25: Push GitHub + déploiement Vercel

**Files:** aucun fichier modifié.

- [ ] **Step 1: Push final**

```bash
git push origin main
```

- [ ] **Step 2: Connecter Vercel au repo**

Aller sur https://vercel.com/new, importer le repo `Lavic69/google-maj-tool`. Accepter les valeurs par défaut Next.js (build command `next build`, output `.next`). Pas de variables d'environnement à fournir aujourd'hui (les stubs n'en ont pas besoin).

- [ ] **Step 3: Vérifier le déploiement**

Vercel donne une URL `*.vercel.app`. Ouvrir, refaire le test du flow complet (au moins steps 2 et 3 de Task 24) sur l'URL de production.
Expected: l'app fonctionne identique à local.

- [ ] **Step 4: Mettre à jour le lien dans le README (si présent)**

Si Next.js a généré un README.md, ajouter en haut :
```markdown
# Google Update Survivor

🌐 [Demo](https://[ton-url].vercel.app)

Migration en cours. API stubs aujourd'hui, intégrations Firecrawl + Anthropic + Notion demain.
```

- [ ] **Step 5: Commit + push final**

```bash
git add README.md
git commit -m "docs: add demo link"
git push origin main
```

---

## Hors scope (rappel — pas dans ce plan)

- Vraie intégration Firecrawl
- Vraie intégration Anthropic Claude Haiku 4.5
- Vraie intégration Notion DB via MCP
- Rate limit serveur Vercel + cap global
- Tests automatisés (Playwright / Vitest)
- PDF "checklist 7 signaux" (supprimé du scope)
- SEO meta tags / OG image / sitemap

À reprendre demain dans un plan séparé.
