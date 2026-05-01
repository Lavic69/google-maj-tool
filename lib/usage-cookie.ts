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
