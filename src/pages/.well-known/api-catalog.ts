import type { APIRoute } from 'astro';
import { SITE } from '../../data/site';
import { siteUrl } from '../../lib/urls';

export const GET: APIRoute = async () => {
  const linkset = [
    {
      anchor: SITE.url,
      'service-desc': [
        {
          href: siteUrl('/spots.json'),
          type: 'application/json',
          title: 'Hoji Ben spot dataset',
        },
      ],
      'service-doc': [
        {
          href: siteUrl('/llms.txt'),
          type: 'text/plain',
          title: 'Hoji Ben LLM guide',
        },
      ],
      describedby: [
        {
          href: siteUrl('/about/'),
          type: 'text/html',
          title: 'About Hoji Ben',
        },
      ],
    },
  ];

  return new Response(JSON.stringify({ linkset }, null, 2), {
    headers: {
      'Content-Type': 'application/linkset+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
