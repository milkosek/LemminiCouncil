/**
 * Social preview images, one PNG per post plus one for the site:
 *   /og/site.png
 *   /og/posts/<post-id>.png
 * Referenced from the og:image / twitter:image tags in BaseLayout.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { renderCard, type CardContent } from '../../lib/og';
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
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderCard(props as CardContent);
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
