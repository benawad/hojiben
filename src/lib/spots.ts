import { getCollection, type CollectionEntry } from 'astro:content';

export type Spot = CollectionEntry<'spots'>;

const DRINK_LABELS: Record<Spot['data']['drink'], string> = {
  latte: 'Hojicha latte',
  straight: 'Straight hojicha',
  softserve: 'Hojicha soft serve',
  other: 'Hojicha',
};

export function drinkLabel(drink: Spot['data']['drink']): string {
  return DRINK_LABELS[drink];
}

// Short label for on-page UI — everything is hojicha, so the word is implied.
const DRINK_SHORT: Record<Spot['data']['drink'], string> = {
  latte: 'Latte',
  straight: 'Straight',
  softserve: 'Soft serve',
  other: 'Hojicha',
};

export function drinkShort(drink: Spot['data']['drink']): string {
  return DRINK_SHORT[drink];
}

/** True for San Francisco spots; false for tagged out-of-town ones. */
export function isLocal(spot: Spot): boolean {
  return spot.data.city === 'San Francisco';
}

export function hasCoordinates(spot: Spot): spot is Spot & {
  data: Spot['data'] & { lat: number; lng: number };
} {
  return typeof spot.data.lat === 'number' && typeof spot.data.lng === 'number';
}

/** TikTok video id parsed from a /video/<id> URL, for embedding. */
export function tiktokId(spot: Spot): string | undefined {
  const url = spot.data.videos.tiktok;
  return url?.match(/\/video\/(\d+)/)?.[1];
}

export type Grade = NonNullable<Spot['data']['grade']>;

// Best → worst. Index = rank (lower is better).
export const GRADE_ORDER: Grade[] = [
  'S', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F',
];

/** Tier buckets for the tier list (collapses +/- into one letter). */
export const TIERS: Array<{ tier: string; grades: Grade[] }> = [
  { tier: 'S', grades: ['S'] },
  { tier: 'A', grades: ['A+', 'A', 'A-'] },
  { tier: 'B', grades: ['B+', 'B', 'B-'] },
  { tier: 'C', grades: ['C+', 'C', 'C-'] },
  { tier: 'D', grades: ['D+', 'D', 'D-'] },
  { tier: 'F', grades: ['F'] },
];

export function gradeRank(grade?: Grade): number {
  if (!grade) return Number.POSITIVE_INFINITY;
  const i = GRADE_ORDER.indexOf(grade);
  return i === -1 ? Number.POSITIVE_INFINITY : i;
}

/** Approximate 0–10 number for schema.org Rating only (not shown in the UI). */
export function gradeToScore(grade?: Grade): number | undefined {
  if (!grade) return undefined;
  const map: Record<Grade, number> = {
    S: 10, 'A+': 9.7, A: 9.3, 'A-': 9, 'B+': 8.3, B: 8, 'B-': 7.7,
    'C+': 6.7, C: 6.3, 'C-': 6, 'D+': 5, D: 4.5, 'D-': 4, F: 2,
  };
  return map[grade];
}

/** All published spots, ranked by grade (best first); ungraded last
    (most recently visited first among them). */
export async function getRankedSpots(): Promise<Spot[]> {
  const spots = await getCollection('spots', ({ data }) => !data.draft);
  return spots.sort((a, b) => {
    const ra = gradeRank(a.data.grade);
    const rb = gradeRank(b.data.grade);
    if (ra === rb) return b.data.dateVisited.valueOf() - a.data.dateVisited.valueOf();
    return ra - rb;
  });
}

/** First video URL available for a spot, preferring TikTok. */
export function primaryVideo(spot: Spot): string | undefined {
  const v = spot.data.videos;
  return v.tiktok ?? v.youtube ?? v.instagram ?? v.x;
}

export function videoEntries(spot: Spot): Array<{ platform: string; url: string }> {
  const v = spot.data.videos;
  const out: Array<{ platform: string; url: string }> = [];
  if (v.tiktok) out.push({ platform: 'TikTok', url: v.tiktok });
  if (v.youtube) out.push({ platform: 'YouTube', url: v.youtube });
  if (v.instagram) out.push({ platform: 'Instagram', url: v.instagram });
  if (v.x) out.push({ platform: 'X', url: v.x });
  return out;
}
