// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lemminicouncil.org',
  trailingSlash: 'ignore',

  integrations: [vue(), mdx(), sitemap()],

  // Remote images used by the embed placeholders are downloaded and optimised
  // at build time, so visitors load them from this site, not from the provider.
  image: {
    domains: ['i.ytimg.com'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.scdn.co' },
      { protocol: 'https', hostname: '**.spotifycdn.com' },
    ],
  },

  markdown: {
    shikiConfig: { theme: 'rose-pine' },
  },

  // Astro 7 defaults to 'jsx', which can drop spaces between inline elements.
  compressHTML: true,
});
