/**
 * Build-time oEmbed lookups for embed placeholders (title, thumbnail).
 *
 * These run during `astro build` only, never in the visitor's browser. Any
 * failure returns null so a flaky provider can never break the build.
 */

export interface OEmbed {
  title?: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
}

export async function fetchOEmbed(endpoint: string, timeoutMs = 5000): Promise<OEmbed | null> {
  try {
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) return null;
    return (await response.json()) as OEmbed;
  } catch {
    return null;
  }
}

export function youTubeOEmbedUrl(videoId: string): string {
  const watch = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  return `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watch)}`;
}

export function spotifyOEmbedUrl(spotifyUrl: string): string {
  return `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`;
}
