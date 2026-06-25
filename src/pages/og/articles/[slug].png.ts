import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { articleCardSvg, pngFromSvg } from '../../../lib/og';

export const getStaticPaths: GetStaticPaths = async () => {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  return articles.map((a) => ({
    params: { slug: a.id },
    props: { slug: a.id, title: a.data.title },
  }));
};

export const GET: APIRoute = ({ props }) => {
  const { slug, title } = props as any;
  const svg = articleCardSvg({ crumb: `articles/${slug}`, title });
  return new Response(pngFromSvg(svg), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
