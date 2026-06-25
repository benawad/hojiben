// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://hojiben.com',
  integrations: [sitemap()],
  // @resvg/resvg-js is a native module used only at build time (OG images).
  vite: { ssr: { external: ['@resvg/resvg-js'] } },
});
