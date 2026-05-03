export type Tier = 'safe' | 'risk' | 'hit';

export type AxisKey = 'eeat' | 'helpful' | 'edito' | 'risk';

export type ObservationSentiment = 'good' | 'bad' | 'neutral';

export interface Observation {
  sentiment: ObservationSentiment;
  text: string;
}

export interface Axis {
  key: AxisKey;
  label: string;
  hint: string;
  score: number;
  observations: Observation[];
}

export type FixTiming = 'now' | 'soon' | 'later';

export interface Fix {
  t: string;
  d: string;
  effort: string;
  timing: FixTiming;
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
