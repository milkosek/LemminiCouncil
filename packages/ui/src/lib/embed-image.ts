/**
 * Embed thumbnails, downloaded and optimised at build time so visitors load them from this site.
 *
 * Astro downloads remote images late in the build, after the pages are rendered, where a failure
 * stops the whole build and can't be caught. So every image is checked here first: a wrong video
 * ID, a removed track or a provider outage logs a warning and the embed renders without its
 * picture instead.
 */
import { getImage } from 'astro:assets';

export type EmbedImage = Awaited<ReturnType<typeof getImage>>;

export interface EmbedImageOptions {
  /** Size of the source image in pixels. */
  width: number;
  height: number;
  /** Widths to generate for srcset (needs `sizes`). Without it, one image at `width`. */
  widths?: number[];
  sizes?: string;
}

export function warnEmbed(message: string): void {
  console.warn(`[embeds] ${message}`);
}

/** True if the image can be downloaded right now. */
export async function remoteImageExists(src: string, timeoutMs = 5000): Promise<boolean> {
  try {
    const signal = AbortSignal.timeout(timeoutMs);
    let response = await fetch(src, { method: 'HEAD', signal });
    // Some CDNs don't answer HEAD; ask for the image itself instead.
    if (response.status === 405 || response.status === 501) response = await fetch(src, { signal });
    return response.ok && (response.headers.get('content-type') ?? '').startsWith('image/');
  } catch {
    return false;
  }
}

/**
 * Prepares an embed thumbnail, or returns null (after a warning, unless `quiet`) if the image
 * can't be downloaded.
 */
export async function embedImage(
  src: string,
  options: EmbedImageOptions,
  label: string,
  { quiet = false } = {},
): Promise<EmbedImage | null> {
  const fail = (reason: string) => {
    if (!quiet) warnEmbed(`${label}: ${reason}, showing the placeholder without a picture.`);
    return null;
  };
  if (!(await remoteImageExists(src))) return fail('thumbnail not available');
  try {
    return await getImage({ src, ...options });
  } catch (error) {
    console.warn(error);
    return fail('thumbnail could not be prepared');
  }
}
