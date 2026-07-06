import type { APIRoute, GetStaticPaths } from 'astro';
import { getRankedSpots, getRankedDrinkSpots, drinkShort, isRankedSpot } from '../../../lib/spots';
import { spotCardSvg, pngFromSvg } from '../../../lib/og';

const pad = (n: number) => String(n).padStart(2, '0');

export const getStaticPaths: GetStaticPaths = async () => {
  const spots = await getRankedSpots();
  const rankedSpots = await getRankedDrinkSpots();
  return spots.map((spot) => ({
    params: { slug: spot.id },
    props: {
      spot,
      rank: isRankedSpot(spot) ? rankedSpots.findIndex((s) => s.id === spot.id) + 1 : undefined,
      total: rankedSpots.length,
    },
  }));
};

export const GET: APIRoute = ({ props }) => {
  const { spot, rank, total } = props as any;
  const svg = spotCardSvg({
    crumb: `spots/${spot.id}`,
    grade: spot.data.grade,
    name: spot.data.name,
    meta: `hojicha ${drinkShort(spot.data.drink).toLowerCase()} · ${spot.data.neighborhood.toLowerCase()}`,
    city: spot.data.city,
    rank: rank ? `rank ${pad(rank)} of ${pad(total)}` : 'special item',
  });
  return new Response(pngFromSvg(svg), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
