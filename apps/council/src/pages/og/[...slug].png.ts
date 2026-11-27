/**
 * Social preview images, one PNG per post plus one for the site:
 *   /og/site.png
 *   /og/posts/<post-id>.png
 * Referenced from the og:image / twitter:image tags in BaseLayout.
 *
 * In `pnpm dev` there are also a few awkward sample cards (/og/dev/<name>.png) for checking the
 * layout; /dev/cards/ shows them all. They're never built for production.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { renderCard, type CardContent } from '../../lib/og';
import { DEV_SAMPLES } from '../../lib/og-samples';
import { getPublishedPosts } from '../../lib/posts';
import { site } from '../../site.config';

export const getStaticPaths = (async () => {
  const posts = await getPublishedPosts();

  const siteCard: CardContent = {
    title: site.tagline,
    description: site.description,
    footnote: site.author,
  };

  return [
    { params: { slug: 'site' }, props: siteCard },
    ...posts.map((post) => ({
      params: { slug: `posts/${post.id}` },
      props: {
        title: post.data.title,
        description: post.data.description,
        footnote: post.data.published.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      } satisfies CardContent,
    })),
    ...(import.meta.env.DEV
      ? Object.entries(DEV_SAMPLES).map(([name, card]) => ({
          params: { slug: `dev/${name}` },
          props: card,
        }))
      : []),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderCard(props as CardContent);
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
