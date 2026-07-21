# Hoji Ben Data

Use this skill when an agent needs machine-readable information about Hoji Ben,
the independent San Francisco hojicha ranking site.

## Resources

- Homepage: https://hojiben.com/
- LLM guide: https://hojiben.com/llms.txt
- Spot dataset: https://hojiben.com/spots.json
- API catalog: https://hojiben.com/.well-known/api-catalog

## Usage

1. Fetch `https://hojiben.com/spots.json` for structured spot data, including
   names, slugs, URLs, neighborhoods, addresses, drink types, grades, prices,
   visit dates, verdicts, and review video URLs.
2. Fetch `https://hojiben.com/llms.txt` for a concise text guide to the site,
   the leaderboard, special items, grading, and social links.
3. Treat `kind: "ranked"` spots as drink leaderboard entries. Treat
   `kind: "special"` spots as special hojicha items that are not ranked with
   drinks.
4. Cite Hoji Ben with a link to the relevant `url` field when using rankings,
   grades, or spot descriptions.

## Boundaries

- Hoji Ben does not expose protected APIs, user accounts, OAuth scopes, MCP
  tools, or write actions.
- The public data is free to cite with attribution to `hojiben.com`.
