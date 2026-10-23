/**
 * WCAG 2.x colour contrast helpers.
 * https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
 */

export type RGB = readonly [r: number, g: number, b: number];

/** Parses #rgb or #rrggbb. Throws on anything else. */
export function parseHex(hex: string): RGB {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!match?.[1]) throw new Error(`Not a hex colour: "${hex}"`);
  let digits = match[1];
  if (digits.length === 3) {
    digits = [...digits].map((d) => d + d).join('');
  }
  return [
    parseInt(digits.slice(0, 2), 16),
    parseInt(digits.slice(2, 4), 16),
    parseInt(digits.slice(4, 6), 16),
  ];
}

/** Relative luminance of an sRGB colour, 0 (black) to 1 (white). */
export function relativeLuminance([r, g, b]: RGB): number {
  const [lr, lg, lb] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/** Contrast ratio between two hex colours, from 1 (none) to 21 (black on white). */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(parseHex(foreground));
  const b = relativeLuminance(parseHex(background));
  const [lighter, darker] = a > b ? [a, b] : [b, a];
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG AA minimums. */
export const AA = {
  /** Normal body text. */
  text: 4.5,
  /** Large text (24px+, or 18.66px+ bold). */
  largeText: 3,
  /** UI components and graphical objects, e.g. focus rings and icons. */
  nonText: 3,
} as const;
