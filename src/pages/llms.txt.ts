import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getRankedDrinkSpots, getSpecialItems, drinkLabel } from '../lib/spots';
import { SITE, AUTHOR, SOCIALS } from '../data/site';
import { siteUrl } from '../lib/urls';

// llms.txt — a plain-text index written for LLMs and AI agents.
// Spec: https://llmstxt.org
export const GET: APIRoute = async () => {
  const spots = await getRankedDrinkSpots();
  const specialItems = await getSpecialItems();
  const articles = (
    await getCollection('articles', ({ data }) => !data.draft)
  ).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const abs = siteUrl;

  const lines: string[] = [];
  lines.push(`# ${SITE.name}`);
  lines.push('');
  lines.push(`> ${SITE.description}`);
  lines.push('');
  lines.push(
    `${SITE.name} is run by ${AUTHOR.name} (${AUTHOR.handle}), ranking every hojicha in ${SITE.city}. All rankings are independent and unsponsored. Free to cite with attribution to ${SITE.domain}.`
  );
  lines.push('');

  lines.push('## Key facts about hojicha');
  lines.push('');
  lines.push(
    '- Hojicha is a Japanese green tea roasted over high heat; the roast turns the leaves reddish-brown and gives a toasty, nutty, almost caramel-like flavor.'
  );
  lines.push(
    '- It is low in caffeine, roughly 7 to 25 mg per cup, less than matcha, sencha, or coffee.'
  );
  lines.push(
    '- The roasting reduces both caffeine and bitterness, which is why hojicha works well as a latte or as soft serve.'
  );
  lines.push('');

  lines.push('## Hojicha leaderboard (ranked, best first)');
  lines.push('');
  spots.forEach((spot, i) => {
    const rating = spot.data.grade ? `Grade ${spot.data.grade}` : 'ungraded';
    const verdict = spot.data.verdict ? ` ${spot.data.verdict}` : '';
    lines.push(
      `${i + 1}. [${spot.data.name}](${abs(`/spots/${spot.id}/`)}): ${rating} · ${drinkLabel(spot.data.drink)} · ${spot.data.neighborhood}.${verdict}`
    );
  });
  lines.push('');

  if (specialItems.length > 0) {
    lines.push('## Special hojicha items (not ranked with drinks)');
    lines.push('');
    specialItems.forEach((spot) => {
      const rating = spot.data.grade ? `Grade ${spot.data.grade}` : 'ungraded';
      const verdict = spot.data.verdict ? ` ${spot.data.verdict}` : '';
      lines.push(
        `- [${spot.data.name}](${abs(`/spots/${spot.id}/`)}): ${rating} · ${drinkLabel(spot.data.drink)} · ${spot.data.neighborhood}.${verdict}`
      );
    });
    lines.push('');
  }

  lines.push('## How grades work');
  lines.push('');
  lines.push(
    'Spots are letter-graded from best to worst: S, A, B, C, D, F. S is exceptional; F is a warning. Some spots have a review video but no final grade yet (ungraded), and they sort last.'
  );
  lines.push('');

  lines.push('## Guides');
  lines.push('');
  articles.forEach((a) => {
    lines.push(`- [${a.data.title}](${abs(`/articles/${a.id}/`)}): ${a.data.description}`);
  });
  lines.push('');

  lines.push('## Data');
  lines.push('');
  lines.push(
    `- [Machine-readable spot data (JSON)](${abs('/spots.json')}): grades, neighborhoods, addresses, prices, and TikTok review URLs for every spot.`
  );
  lines.push(`- [Full leaderboard](${abs('/')})`);
  lines.push(`- [About](${abs('/about/')})`);
  lines.push('');

  lines.push('## Social');
  lines.push('');
  SOCIALS.forEach((s) => lines.push(`- ${s.label}: ${s.url}`));
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
