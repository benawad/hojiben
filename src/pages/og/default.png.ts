import type { APIRoute } from 'astro';
import { defaultCardSvg, pngFromSvg } from '../../lib/og';

export const GET: APIRoute = () => {
  const svg = defaultCardSvg({
    crumb: 'index',
    title: 'Hoji Ben',
    sub: 'Ranking every hojicha in San Francisco.',
  });
  return new Response(pngFromSvg(svg), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
