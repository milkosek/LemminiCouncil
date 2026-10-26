/**
 * Social preview cards (Open Graph images), rendered at build time.
 *
 * Satori lays out a small element tree and turns it into an SVG (text becomes vector paths, so
 * the result doesn't depend on fonts installed on the build machine). Sharp then converts that
 * SVG to a 1200×630 PNG, the size LinkedIn, Discord, Slack and others expect.
 *
 * When the commissioned artwork arrives, add it here and every card picks it up.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori, { type SatoriOptions } from 'satori';
import sharp from 'sharp';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
const PADDING_X = 80;
const CONTENT_WIDTH = OG_WIDTH - 2 * PADDING_X;

/** Night palette, mirrored from packages/ui/src/styles/tokens.css. */
const colors = {
  bg: '#14110f',
  text: '#e9e1d0',
  muted: '#a39a88',
  accent: '#d65a52',
  seal: '#9e2b25',
  brass: '#c9a45c',
  parchment: '#f4ecdc',
};

type Font = SatoriOptions['fonts'][number];

// Satori reads TTF/OTF/WOFF (not WOFF2). Fontsource ships WOFF files next to the WOFF2 ones.
// The latin-ext subsets cover Polish and other accented characters.
const FONT_FILES: { name: string; pkg: string; file: string; weight: Font['weight'] }[] = [
  {
    name: 'Cormorant',
    pkg: 'cormorant-garamond',
    file: 'cormorant-garamond-latin-700-normal.woff',
    weight: 700,
  },
  {
    name: 'CormorantExt',
    pkg: 'cormorant-garamond',
    file: 'cormorant-garamond-latin-ext-700-normal.woff',
    weight: 700,
  },
  {
    name: 'SourceSerif',
    pkg: 'source-serif-4',
    file: 'source-serif-4-latin-400-normal.woff',
    weight: 400,
  },
  {
    name: 'SourceSerifExt',
    pkg: 'source-serif-4',
    file: 'source-serif-4-latin-ext-400-normal.woff',
    weight: 400,
  },
];

let fontsPromise: Promise<Font[]> | undefined;

function loadFonts(): Promise<Font[]> {
  // Builds run from apps/council, whose node_modules links the @fontsource packages.
  fontsPromise ??= Promise.all(
    FONT_FILES.map(async ({ name, pkg, file, weight }) => ({
      name,
      weight,
      style: 'normal' as const,
      data: await readFile(join(process.cwd(), 'node_modules', '@fontsource', pkg, 'files', file)),
    })),
  );
  return fontsPromise;
}

type Child = Element | string;
interface Element {
  type: string;
  props: { style?: Record<string, string | number>; children?: Child | Child[] };
}

/** Tiny helper so the layout below reads like markup. Satori needs display:flex on containers. */
function el(style: Record<string, string | number>, ...children: Child[]): Element {
  return {
    type: 'div',
    props: {
      style: { display: 'flex', ...style },
      children: children.length === 1 ? children[0] : children,
    },
  };
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

export interface CardContent {
  title: string;
  description?: string;
  /** Shown bottom left, e.g. the publication date. */
  footnote?: string;
}

export async function renderCard({
  title,
  description,
  footnote,
}: CardContent): Promise<Uint8Array> {
  const display = 'Cormorant, CormorantExt, serif';
  const body = 'SourceSerif, SourceSerifExt, serif';
  const titleSize = title.length > 60 ? 58 : title.length > 36 ? 68 : 80;

  const tree = el(
    {
      // Explicit size and border-box, so padding and the top bar stay inside the 1200×630 canvas.
      width: `${OG_WIDTH}px`,
      height: `${OG_HEIGHT}px`,
      boxSizing: 'border-box',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: `64px ${PADDING_X}px`,
      backgroundColor: colors.bg,
      borderTop: `10px solid ${colors.seal}`,
      color: colors.text,
      fontFamily: body,
    },
    // Masthead: seal + name
    el(
      { alignItems: 'center', gap: '22px' },
      el(
        {
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: colors.seal,
          border: `2px solid ${colors.brass}`,
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.parchment,
          fontFamily: display,
          fontSize: '30px',
        },
        'LC',
      ),
      el(
        { fontFamily: display, fontSize: '34px', color: colors.brass, letterSpacing: '0.12em' },
        'LEMMINI COUNCIL',
      ),
    ),
    // Title + description
    el(
      { flexDirection: 'column', gap: '24px', width: `${CONTENT_WIDTH}px` },
      el(
        { fontFamily: display, fontSize: `${titleSize}px`, lineHeight: 1.08, color: colors.text },
        truncate(title, 110),
      ),
      ...(description
        ? [
            el(
              { fontSize: '30px', lineHeight: 1.4, color: colors.muted },
              truncate(description, 150),
            ),
          ]
        : []),
    ),
    // Footer line
    el(
      {
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '22px',
        borderTop: `1px solid ${colors.brass}`,
        fontSize: '26px',
        color: colors.muted,
      },
      footnote ?? '',
      el({ color: colors.brass }, 'lemminicouncil.org'),
    ),
  );

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: await loadFonts(),
  });

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return Uint8Array.from(png);
}
