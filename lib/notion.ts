import { Client } from '@notionhq/client';

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export const NOTION_LEADS_DB_ID = process.env.NOTION_DB_ID || '';

export function isNotionConfigured(): boolean {
  return Boolean(process.env.NOTION_TOKEN && NOTION_LEADS_DB_ID);
}
