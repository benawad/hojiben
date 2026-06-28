// Schema.org JSON-LD builders. These are what make Hoji Ben legible to search
// engines and LLM agents — clean, structured facts they can cite.
import { SITE, AUTHOR, SAME_AS } from '../data/site';
import { drinkLabel, primaryVideo, gradeToScore, type Spot } from './spots';

const abs = (path: string) => new URL(path, SITE.url).toString();

function spotVideoSchema(spot: Spot, video: string, name: string) {
  return {
    '@type': 'VideoObject',
    name,
    contentUrl: video,
    uploadDate: spot.data.dateVisited.toISOString().slice(0, 10),
    thumbnailUrl: abs(`/og/spots/${spot.id}.png`),
    description:
      spot.data.verdict ??
      `${spot.data.name} hojicha ${drinkLabel(spot.data.drink).toLowerCase()} review in ${spot.data.neighborhood}, ${SITE.city}.`,
  };
}

export function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': abs('/#person'),
    name: AUTHOR.name,
    alternateName: AUTHOR.handle,
    description: AUTHOR.bio,
    url: SITE.url,
    image: abs(AUTHOR.avatar),
    sameAs: SAME_AS,
    knowsAbout: ['Hojicha', 'Japanese tea', 'San Francisco cafés', 'Hojicha latte'],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': abs('/#website'),
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    publisher: { '@id': abs('/#person') },
    inLanguage: 'en-US',
  };
}

/** A FoodEstablishment + nested Review for one spot. */
export function spotSchema(spot: Spot) {
  const url = abs(`/spots/${spot.id}`);
  const video = primaryVideo(spot);
  return {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    '@id': `${url}#place`,
    name: spot.data.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: spot.data.address,
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      addressCountry: SITE.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: spot.data.lat,
      longitude: spot.data.lng,
    },
    servesCuisine: 'Hojicha',
    url,
    // Only emit a Review (with rating) once the spot is actually graded.
    ...(spot.data.grade
      ? {
          review: {
            '@type': 'Review',
            author: { '@id': abs('/#person') },
            datePublished: spot.data.dateVisited.toISOString().slice(0, 10),
            ...(spot.data.verdict ? { reviewBody: spot.data.verdict } : {}),
            itemReviewed: { '@type': 'FoodEstablishment', name: spot.data.name },
            reviewRating: {
              '@type': 'Rating',
              ratingValue: gradeToScore(spot.data.grade),
              alternateName: spot.data.grade,
              bestRating: 10,
              worstRating: 0,
            },
            ...(video ? { associatedMedia: spotVideoSchema(spot, video, `${spot.data.name} hojicha review`) } : {}),
          },
        }
      : video
        ? { subjectOf: spotVideoSchema(spot, video, `${spot.data.name} hojicha`) }
        : {}),
  };
}

/** ItemList of the ranked leaderboard. */
export function leaderboardSchema(spots: Spot[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': abs('/#leaderboard'),
    name: 'Best Hojicha in San Francisco',
    description: 'Hoji Ben’s ranked list of hojicha spots in San Francisco.',
    numberOfItems: spots.length,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    itemListElement: spots.map((spot, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: abs(`/spots/${spot.id}`),
      name: `${spot.data.name}: ${drinkLabel(spot.data.drink)}`,
    })),
  };
}

/** FAQPage built from an article's q/a pairs. */
export function faqSchema(items: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  slug: string;
  pubDate: Date;
  updatedDate?: Date;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    datePublished: opts.pubDate.toISOString().slice(0, 10),
    ...(opts.updatedDate ? { dateModified: opts.updatedDate.toISOString().slice(0, 10) } : {}),
    author: { '@id': abs('/#person') },
    publisher: { '@id': abs('/#person') },
    mainEntityOfPage: abs(`/articles/${opts.slug}`),
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}
