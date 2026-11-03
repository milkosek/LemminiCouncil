/**
 * Downloads and optimises an embed's thumbnail at build time.
 *
 * Unlike <Image> in a template, a failure here can be caught: a wrong video ID, a removed track or
 * a provider outage logs a warning and the embed renders without its picture instead of failing
 * the whole build.
 */
import { getImage } from 'astro:assets';

export type EmbedImage = Awaited<ReturnType<typeof getImage>>;

export function warnEmbed(message: string): void {
  console.warn(`[embeds] ${message}`);
}

export async function embedImage(
  src: string,
  width: number,
  height: number,
  label: string,
): Promise<EmbedImage | null> {
  try {
    return await getImage({ src, width, height });
  } catch (error) {
    warnEmbed(`${label}: thumbnail download failed, showing the placeholder without it.`);
    console.warn(error);
    return null;
  }
}
