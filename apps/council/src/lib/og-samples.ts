/**
 * Dev-only sample cards (/og/dev/<name>.png), shown on /dev/cards/ in `pnpm dev`.
 * Never built for production.
 */
import type { CardContent } from './og';

/** Edge cases for the card layout: long text, no description, accented characters. */
export const DEV_SAMPLES: Record<string, CardContent> = {
  'long-title': {
    title:
      'A very long title that keeps going, to see where the card wraps it and when it gets cut off at the end',
    description:
      'And an equally long description, well past the 160 characters a description should have, so the truncation at the end of the second or third line can be checked too.',
    footnote: '29 November 2026',
  },
  'short-title': { title: 'Ethics', footnote: '29 November 2026' },
  accents: {
    title: 'Zażółć gęślą jaźń: Polish and other accents',
    description:
      'Ćma, łódź, źrebię, Ñandú, Ærø, Šťastný. Every letter should come from the card fonts.',
    footnote: 'Mateusz Miłkowski',
  },
};
