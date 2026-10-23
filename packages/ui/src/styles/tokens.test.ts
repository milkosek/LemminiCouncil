/**
 * Guards the design tokens: every text/background pair the sites use must
 * meet WCAG AA in both themes. If this fails, fix the colour in tokens.css
 * (and the table in docs/DESIGN.md), don't loosen the test.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { AA, contrastRatio } from '../lib/contrast';

const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');

/** Collects the custom properties declared in every rule whose selector matches. */
function tokensFor(selectorPart: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const [, selector = '', body = ''] of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!selector.includes(selectorPart)) continue;
    for (const [, name = '', value = ''] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      tokens[name] = value.trim();
    }
  }
  return tokens;
}

const themes = {
  night: tokensFor("[data-theme='night']"),
  day: tokensFor("[data-theme='day']"),
};

/** [foreground, background, minimum ratio, where it's used] */
const pairs: [string, string, number, string][] = [
  ['--text', '--bg', AA.text, 'body text'],
  ['--text', '--surface', AA.text, 'text in cards and code blocks'],
  ['--text-muted', '--bg', AA.text, 'dates, captions, meta'],
  ['--text-muted', '--surface', AA.text, 'repo descriptions on cards'],
  ['--accent', '--bg', AA.text, 'links'],
  ['--accent', '--surface', AA.text, 'links on cards'],
  ['--accent-strong', '--bg', AA.text, 'hovered links'],
  ['--on-accent', '--accent', AA.text, 'text on accent buttons'],
  ['--brass', '--bg', AA.text, 'small labels (eyebrows, footer)'],
  ['--brass', '--surface', AA.nonText, 'focus ring on cards'],
];

const colourTokens = [
  ...new Set(pairs.flat().filter((t): t is string => typeof t === 'string' && t.startsWith('--'))),
];

describe.each(Object.entries(themes))('%s theme', (_name, tokens) => {
  it('defines every colour token as a hex value', () => {
    for (const token of colourTokens) {
      expect(tokens[token], `${token} is missing`).toMatch(/^#(?:[0-9a-f]{3}){1,2}$/i);
    }
  });

  it.each(pairs)('%s on %s meets %s:1 (%s)', (fg, bg, minimum) => {
    const ratio = contrastRatio(tokens[fg]!, tokens[bg]!);
    expect(
      ratio,
      `${fg} ${tokens[fg]} on ${bg} ${tokens[bg]} is ${ratio.toFixed(2)}:1`,
    ).toBeGreaterThanOrEqual(minimum);
  });
});

describe('themes', () => {
  it('both define the same colour tokens', () => {
    expect(Object.keys(themes.day).sort()).toEqual(Object.keys(themes.night).sort());
  });
});
