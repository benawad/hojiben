// Central site config — single place for branding, author, and socials.
// NOTE: only TikTok is confirmed. The other three are placeholders pointing at
// the @hojiben handle — update the URLs once the real handles are confirmed.

export const SITE = {
  name: 'Hoji Ben',
  domain: 'hojiben.com',
  url: 'https://hojiben.com',
  tagline: 'Trying every hojicha in San Francisco.',
  description:
    'Hoji Ben is the hub for hojicha in San Francisco: a ranked, reviewed guide to every hojicha latte, straight hojicha, and hojicha soft serve in the city. One person, every spot, honestly graded.',
  city: 'San Francisco',
  region: 'CA',
  country: 'US',
  // Google Analytics 4 Measurement ID, e.g. 'G-XXXXXXXXXX'. Paste yours here.
  // Loads only in production builds; leave '' to disable.
  gaId: 'G-YGQM3T90FZ',
} as const;

export const AUTHOR = {
  name: 'Hoji Ben',
  handle: '@hojiben',
  // Drop a square image at public/hojiben.jpg to replace the monogram placeholder.
  avatar: '/hojiben.jpg',
  bio: 'On a mission to try every hojicha in San Francisco and rank them all.',
} as const;

export type SocialPlatform = 'tiktok' | 'instagram' | 'youtube' | 'x';

export const SOCIALS: Array<{
  platform: SocialPlatform;
  label: string;
  url: string;
  confirmed: boolean;
}> = [
  { platform: 'tiktok', label: 'TikTok', url: 'https://www.tiktok.com/@hojiben', confirmed: true },
  { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/hojiben0', confirmed: true },
  { platform: 'youtube', label: 'YouTube', url: 'https://youtube.com/@hojiben0', confirmed: true },
  { platform: 'x', label: 'X', url: 'https://x.com/hojiben', confirmed: true },
];

// sameAs array for Person schema — every social URL.
export const SAME_AS = SOCIALS.map((s) => s.url);
