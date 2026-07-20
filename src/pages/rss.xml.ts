import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getRankedSpots, drinkLabel } from '../lib/spots';
import { SITE } from '../data/site';

export const GET: APIRoute = async (context) => {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  const spots = await getRankedSpots();

  const articleItems = articles.map((a) => ({
    title: a.data.title,
    description: a.data.description,
    pubDate: a.data.pubDate,
    link: `/articles/${a.id}/`,
  }));

  const spotItems = spots.map((spot) => ({
    title: `${spot.data.name}: ${spot.data.grade ? `${spot.data.grade} ` : ''}${drinkLabel(spot.data.drink)}`,
    description: spot.data.verdict ?? `Hojicha at ${spot.data.name}, ${spot.data.neighborhood}.`,
    pubDate: spot.data.dateVisited,
    link: `/spots/${spot.id}/`,
  }));

  const items = [...articleItems, ...spotItems].sort(
    (a, b) => b.pubDate.valueOf() - a.pubDate.valueOf()
  );

  return rss({
    title: `${SITE.name}: Hojicha in San Francisco`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items,
  });
};
