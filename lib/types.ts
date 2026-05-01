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
