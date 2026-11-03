import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  // `image` validates a path relative to the post file and lets Astro optimise the picture.
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        /** Used for meta tags, listings and the RSS feed. */
        description: z.string(),
        published: z.coerce.date(),
        updated: z.coerce.date().optional(),
        tags: z.array(z.string()).default([]),
        /** Name of the series this post belongs to. Posts with the same name form one series. */
        series: z.string().optional(),
        /** Position within the series (1, 2, 3, …). Without it, parts are ordered by date. */
        seriesOrder: z.number().int().positive().optional(),
        /** Set to false to hide the comments section on this post. */
        comments: z.boolean().default(true),
        /** Drafts are visible in `pnpm dev` only and never ship to production. */
        draft: z.boolean().default(false),
        /**
         * Optional banner shown above the post, e.g. ./images/<post-id>/banner.jpg.
         * Wide pictures work best (about 2:1, at least 2000px across).
         */
        heroImage: image().optional(),
        /** Describes the banner for screen readers. Use "" if it's purely decorative. */
        heroImageAlt: z.string().optional(),
      })
      .refine((post) => !post.heroImage || post.heroImageAlt !== undefined, {
        message: 'Add heroImageAlt to describe the banner (or "" if it is purely decorative).',
        path: ['heroImageAlt'],
      }),
});

export const collections = { posts };
