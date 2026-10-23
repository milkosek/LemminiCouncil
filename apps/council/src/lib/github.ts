/**
 * Build-time GitHub lookups for the portfolio section.
 *
 * Runs during `astro build` only. Set GITHUB_TOKEN in the build environment to
 * avoid the low anonymous rate limit. Any failure returns an empty list.
 */

export interface Repo {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  updated: Date;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
}

export async function getRecentRepos(
  username: string,
  { count = 6, exclude = [] as readonly string[] } = {},
): Promise<Repo[]> {
  if (!username) return [];

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = import.meta.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=50`,
      { headers, signal: AbortSignal.timeout(8000) },
    );
    if (!response.ok) {
      console.warn(`[github] ${response.status} fetching repos for ${username}`);
      return [];
    }
    const repos = (await response.json()) as GitHubRepo[];
    return repos
      .filter((r) => !r.fork && !r.archived && !exclude.includes(r.name))
      .slice(0, count)
      .map((r) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        language: r.language,
        stars: r.stargazers_count,
        updated: new Date(r.pushed_at),
      }));
  } catch (error) {
    console.warn('[github] could not fetch repos:', error);
    return [];
  }
}
