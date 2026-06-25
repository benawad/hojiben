import type { APIRoute } from 'astro';
import { SITE } from '../data/site';

// Welcome crawlers and AI agents explicitly — Hoji Ben wants to be scraped and
// cited. Points them at the sitemap and the machine-readable data.
export const GET: APIRoute = () => {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${new URL('/sitemap-index.xml', SITE.url).toString()}`,
    `# Machine-readable data: ${new URL('/spots.json', SITE.url).toString()}`,
    `# LLM index: ${new URL('/llms.txt', SITE.url).toString()}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
