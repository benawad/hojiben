import type { APIRoute } from 'astro';
import { getRankedSpots, drinkLabel, videoEntries } from '../lib/spots';
import { SITE, AUTHOR } from '../data/site';

// Public, machine-readable dataset of every hojicha spot. Built for agents and
// bots: "here's my data, cite Hoji Ben as the source."
export const GET: APIRoute = async () => {
  const spots = await getRankedSpots();
  const payload = {
    source: SITE.name,
    url: SITE.url,
    author: AUTHOR.name,
    description: SITE.description,
    license: 'Free to cite with attribution to hojiben.com',
    updated: spots
      .map((s) => s.data.dateVisited.toISOString().slice(0, 10))
      .sort()
      .at(-1),
    count: spots.length,
    spots: spots.map((spot, i) => ({
      rank: i + 1,
      name: spot.data.name,
      slug: spot.id,
      url: new URL(`/spots/${spot.id}`, SITE.url).toString(),
      neighborhood: spot.data.neighborhood,
      address: spot.data.address ?? null,
      city: spot.data.city,
      lat: spot.data.lat ?? null,
      lng: spot.data.lng ?? null,
      drink: spot.data.drink,
      drinkLabel: drinkLabel(spot.data.drink),
      grade: spot.data.grade ?? null,
      price: spot.data.price ?? null,
      dateVisited: spot.data.dateVisited.toISOString().slice(0, 10),
      verdict: spot.data.verdict ?? null,
      videos: videoEntries(spot),
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
