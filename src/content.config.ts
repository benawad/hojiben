import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Every hojicha spot. This is the single source of truth that powers the map,
// the leaderboard, spot pages, JSON-LD, /spots.json, RSS, and llms.txt.
const spots = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/spots' }),
  schema: z.object({
    name: z.string(),
    neighborhood: z.string(),
    address: z.string().optional(),
    // City; anything other than San Francisco is tagged "out of town" and kept
    // off the SF map.
    city: z.string().default('San Francisco'),
    lat: z.number().optional(),
    lng: z.number().optional(),
    // Letter grade (how Hoji Ben actually rates). Optional: ungraded spots sort
    // last and render as "—" until a grade is added.
    grade: z
      .enum(['S', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'])
      .optional(),
    drink: z.enum(['latte', 'straight', 'softserve', 'other']),
    price: z.string().optional(),
    dateVisited: z.coerce.date(),
    videos: z
      .object({
        tiktok: z.string().url().optional(),
        youtube: z.string().url().optional(),
        instagram: z.string().url().optional(),
        x: z.string().url().optional(),
      })
      .default({}),
    // One-line verdict for the leaderboard + map hover. Optional until written.
    verdict: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // Optional Q&A pairs; emitted as FAQPage JSON-LD for search + LLM citation.
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { spots, articles };
