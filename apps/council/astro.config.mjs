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

  // Always ship CSS as files instead of inlining small stylesheets into <style> tags.
  // Inlined styles from components used inside posts don't get CSP hashes, so the browser
  // blocks them; files from this site are allowed by 'self'.
  build: {
    inlineStylesheets: 'never',
  },

  // Content-Security-Policy, added to every page as a <meta> tag at build time (not in `pnpm dev`).
  // Astro hashes its own scripts and styles; everything else must come from this site.
  // frame-ancestors can't be set in a <meta> tag, so it lives in public/_headers.
  security: {
    csp: {
      scriptDirective: {
        // 'wasm-unsafe-eval' lets Pagefind run its WebAssembly search engine. It does not allow eval().
        resources: ["'self'", "'wasm-unsafe-eval'"],
      },
      styleDirective: {
        resources: [
          "'self'",
          // style="" attributes from code highlighting and Vue bindings (becomes style-src-attr).
          // Style attributes can't run code.
          { resource: "'unsafe-inline'", kind: 'attribute' },
        ],
      },
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        // data: covers tiny font files the build inlines into the CSS instead of separate files.
        "font-src 'self' data:",
        "connect-src 'self'",
        // Embeds, only after the visitor clicks play.
        'frame-src https://www.youtube-nocookie.com https://open.spotify.com',
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
    },
  },
});
