import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/** All posts that should be built, newest first. Drafts are included in dev only. */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.published.getTime() - a.data.published.getTime());
}

/** Rough reading time in minutes, from the raw Markdown body. */
export function readingTime(post: Post, wordsPerMinute = 220): number {
  const words = (post.body ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}

export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Every tag with its posts, sorted by name. */
export function groupByTag(posts: Post[]): { tag: string; slug: string; posts: Post[] }[] {
  const map = new Map<string, { tag: string; slug: string; posts: Post[] }>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const slug = tagSlug(tag);
      const entry = map.get(slug) ?? { tag, slug, posts: [] };
      entry.posts.push(post);
      map.set(slug, entry);
    }
  }
  return [...map.values()].sort((a, b) => a.tag.localeCompare(b.tag));
}

export function postUrl(post: Post): string {
  return `/posts/${post.id}/`;
}
