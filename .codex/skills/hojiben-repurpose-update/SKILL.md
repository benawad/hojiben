---
name: hojiben-repurpose-update
description: Use when updating the Hojiben website from Repurpose and Google Drive videos, including retrieving new video URLs, updating Astro content, downloading Drive files, and keeping public commits free of private account details.
---

# Hojiben Repurpose Update

Use this for Hojiben content updates that start from Repurpose or Google Drive video outputs.

## Public Repo Rules

- This repo is public. Do not commit emails, passwords, raw Repurpose JSON, local machine paths, checksums, browser-session notes, or credential instructions.
- If private account details are needed, put them in `secrets.local.md` beside this file. That file is gitignored.
- Public commits should contain only website code/content intended to appear on hojiben.com.
- If a temporary scratch record is needed, write it outside the repo.
- Before committing, scan for private residue:

```bash
rg -n "/Users/|/private/tmp|BW_|password|repurpose-password|raw Repurpose|checksum|sha256|gmail|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}" .
```

Inspect and remove any private hits.

## Website Repo

Public content lives in:

- `src/content/spots/*.md`
- `src/content/articles/*.md`
- `src/content.config.ts`

Validate with:

```bash
npm run build
```

## Repurpose

Use the project’s configured headed browser workflow for logged-in Repurpose work. Keep credentials in private local tooling or `secrets.local.md`; never print or commit them.

Useful Repurpose data:

- Workflow pages expose `viewEpisodes/<id>` links.
- Logged-in browser sessions can fetch day events with `/get-day-events/<date>?limit=100&tz=America/Los_Angeles`.

Capture only public website fields:

- Shop/video title
- Published or visit date
- TikTok, YouTube, Instagram, and X URLs
- Google Drive file ID or public view URL when useful
- Spoken metadata from the video transcript: day number, shop name, item type,
  price, milk/base, sweetness, toppings/modifiers, grade/ranking, and concise
  verdict/tasting notes
- Address, neighborhood, and coordinates only when they are spoken, visible, or
  verified from a public source
- If transcripts or Repurpose omit location metadata, exhaust text/public lookup
  sources before leaving fields blank: official site/social profile,
  Google/Apple/OSM map listings, local press, Yelp, and other indexed pages.
  Use video frames only as a last-resort disambiguation aid; they rarely contain
  reliable metadata. Only publish an exact address/coordinate when the candidate
  is disambiguated.

Do not commit raw API responses or transcript JSON.

## Google Drive

Use the configured Drive CLI/account to inspect and download files. Keep account names and auth notes out of commits.

Example shape:

```bash
gog --account <configured-drive-account> drive get <file-id> --json --no-input
gog --account <configured-drive-account> drive download <file-id> --out <outside-repo>/<slug>.mp4 --overwrite --json --no-input
```

Only make Drive files public after explicit user approval:

```bash
gog --account <configured-drive-account> drive share <file-id> --to=anyone --role=reader --force --json --no-input
```

## Transcription

Always transcribe downloaded videos before updating spot content. Use the local
FluidAudio CLI when available:

```bash
fluidaudiocli transcribe <outside-repo>/<slug>.mp4 --output-json <outside-repo>/<slug>.transcription.json
```

If the CLI is not on `PATH`, use the project’s local FluidAudio binary or package
checkout from private tooling. Store transcript JSON outside the repo.

Use the transcript to fill public metadata. If speech-to-text is ambiguous,
cross-check with Repurpose titles, public web/map sources, and existing content
before publishing a name or grade. Use video frames only after those sources are
exhausted.

## Public Metadata Lookup

After transcription, fill the rest of the metadata from public text/map sources:

- `address`, `lat`, and `lng`
- precise neighborhood
- whether the place has multiple branches and which branch the video shows
- official shop spelling when STT and Repurpose disagree

If public lookup returns multiple plausible branches and the video/transcript
does not disambiguate them, leave address/coordinates empty and keep a broad
neighborhood rather than guessing.

Only inspect video frames after Repurpose fields, transcript, search results,
official pages, social profiles, map listings, and local press have failed to
disambiguate a field. Treat frames as weak supporting evidence, not a source of
record.

## Website Update Flow

1. Compare Repurpose videos with existing `src/content/spots/*.md`.
2. Download each missing Drive video outside the repo.
3. Transcribe each video with FluidAudio.
4. Add missing spot markdown with public social URLs and transcript-derived
   metadata.
5. Use public lookup to fill official spelling, address, coordinates, and precise
   neighborhood where safely verifiable. Use video-frame reasoning only as a
   last resort after public text/map sources are exhausted.
6. Use `drink: softserve` for KISS of Matcha unless a future item is explicitly
   a drink; the current KISS of Matcha entry is soft serve only.
7. Update related articles when new content changes their claims.
8. Use `dateVisited` only when the date is known from video/workflow evidence.
9. Leave address and coordinates empty unless verified from public-safe source
   material.
10. Run `npm run build`.
11. Run the public-safety grep from above.
12. Commit only public-facing website files and this public skill. Do not commit `secrets.local.md`.
