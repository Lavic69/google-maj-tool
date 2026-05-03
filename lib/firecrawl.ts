interface FirecrawlScrapeResponse {
  success: boolean;
  data?: {
    markdown?: string;
    metadata?: {
      title?: string;
      description?: string;
      ogTitle?: string;
      ogDescription?: string;
      language?: string;
      sourceURL?: string;
      statusCode?: number;
    };
  };
  error?: string;
}

export interface ScrapedPage {
  url: string;
  title: string;
  description: string;
  markdown: string;
  language: string | null;
}

export class FirecrawlError extends Error {
  constructor(message: string, public readonly upstream?: unknown) {
    super(message);
    this.name = 'FirecrawlError';
  }
}

const FIRECRAWL_ENDPOINT = 'https://api.firecrawl.dev/v1/scrape';
const TIMEOUT_MS = 25_000;
const MAX_MARKDOWN_CHARS = 18_000; // ~5K tokens — keeps Claude prompt cost predictable

export async function scrape(url: string): Promise<ScrapedPage> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new FirecrawlError('FIRECRAWL_API_KEY is not configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(FIRECRAWL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
        timeout: 20_000,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new FirecrawlError('scrape timed out');
    }
    throw new FirecrawlError('scrape network error', err);
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new FirecrawlError(`Firecrawl returned ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as FirecrawlScrapeResponse;
  if (!json.success || !json.data) {
    throw new FirecrawlError(`Firecrawl response failed: ${json.error || 'unknown'}`);
  }

  const md = (json.data.markdown || '').slice(0, MAX_MARKDOWN_CHARS);
  const meta = json.data.metadata || {};

  return {
    url,
    title: meta.title || meta.ogTitle || '',
    description: meta.description || meta.ogDescription || '',
    markdown: md,
    language: meta.language || null,
  };
}
