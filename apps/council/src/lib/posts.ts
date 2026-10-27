import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/**
 * Descriptions show up under the title in search results and link previews. LinkedIn asks for at
 * least 100 characters; around 100–160 reads well everywhere.
 */
const DESCRIPTION_MIN = 100;
const DESCRIPTION_MAX = 160;
const warned = new Set<string>();

/** Warns (once per post, without failing the build) about descriptions outside the ideal length. */
function checkDescription(post: Post): void {
  if (post.data.draft || warned.has(post.id)) return;
  warned.add(post.id);
  const length = post.data.description.length;
  if (length < DESCRIPTION_MIN || length > DESCRIPTION_MAX) {
    console.warn(
      `[posts] "${post.id}": description is ${length} characters; aim for ` +
        `${DESCRIPTION_MIN}–${DESCRIPTION_MAX} so search results and link previews show it in full.`,
    );
  }
}

/** All posts that should be built, newest first. Drafts are included in dev only. */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  posts.forEach(checkDescription);
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
