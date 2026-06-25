import type { APIRoute } from 'astro';
import { getRankedSpots, isLocal } from '../../lib/spots';
import { homeCardSvg, pngFromSvg } from '../../lib/og';

const pad = (n: number) => String(n).padStart(2, '0');

export const GET: APIRoute = async () => {
  const spots = (await getRankedSpots()).filter(isLocal).slice(0, 3);
  const rows = spots.map((s, i) => ({
    n: pad(i + 1),
    grade: s.data.grade ?? '?',
    name: s.data.name,
    area: s.data.neighborhood.toLowerCase(),
  }));
  const svg = homeCardSvg({ crumb: 'index', headline: 'Best hojicha in San Francisco', rows });
  return new Response(pngFromSvg(svg), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
