# Hoji Ben

The hojicha hub for San Francisco. One person trying and ranking every hojicha
(roasted Japanese green tea) in the city, at [hojiben.com](https://hojiben.com).

Built to rank well in search and to be a clean, structured source that AI agents
can scrape and cite.

## Stack

- [Astro](https://astro.build) (static output)
- Plain CSS with design tokens (`src/styles/tokens.css`). No Tailwind.
- Deployed as static assets to Cloudflare Pages.

## Project structure

```text
src/
├── content/
│   ├── spots/         # one markdown file per cafe (the source of truth)
│   └── articles/      # hojicha guides
├── content.config.ts  # zod schemas for the collections
├── components/        # Layout, Leaderboard, MapPlate, SEO, Analytics
├── lib/
│   ├── spots.ts       # ranking, grade, and drink helpers
│   ├── schema.ts      # JSON-LD builders (Person, FoodEstablishment, FAQPage, ...)
│   └── og.ts          # build-time Open Graph image generator
├── og/fonts/          # vendored TTFs for the OG images
└── pages/
    ├── index.astro    # the ranked leaderboard (home)
    ├── about.astro
    ├── spots/[slug]   # per-cafe review pages
    ├── articles/      # guides
    ├── og/            # build-time PNG endpoints
    └── llms.txt.ts, rss.xml.ts, robots.txt.ts, spots.json.ts
```

## How it works

- **Spots** are markdown files in `src/content/spots/`. Each carries a name,
  neighborhood, address, lat/lng, drink, letter grade (S to F), price, visit
  date, and a TikTok link. That single source drives the leaderboard, the map,
  per-spot pages, the JSON-LD, `/spots.json`, RSS, and `llms.txt`.
- **Ranking** is by letter grade, best to worst, ungraded last (`lib/spots.ts`).
- **Out-of-town** spots (anything outside San Francisco) keep a detail page but
  are tagged and kept off the SF leaderboard and map.
- **Agent/SEO layer**: schema.org JSON-LD (incl. FAQPage on guides), a sitemap,
  `robots.txt`, `llms.txt`, an RSS feed, and `/spots.json` for machine readers.
- **Open Graph images** are generated at build time from SVG templates rendered
  to PNG (`lib/og.ts` + the `pages/og/` endpoints). Spot cards lead with the
  letter grade; article and home cards get their own layouts.

## Adding a spot

Drop a new markdown file in `src/content/spots/` matching the schema in
`src/content.config.ts`. Everything else (rank, map pin, schema, feeds, OG image)
updates from it on the next build.

## Development

```sh
npm install
npm run dev      # local dev server
npm run build    # production build (also generates OG images)
npm run preview  # serve the build locally
```

A background dev wrapper is also available: `astro dev --background`, then
`astro dev stop` / `astro dev status` / `astro dev logs`.

## Analytics

Google Analytics 4 loads in production only. Paste your Measurement ID into
`gaId` in `src/data/site.ts`; leave it empty to disable.
