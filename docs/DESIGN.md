# Design

## Concept: the Council Chamber

The Council should feel like a chamber where serious matters are debated: editorial, typographic and
calm, somewhere between a broadsheet newspaper and a parliamentary record. There should be a wink of
humour, but the words do the work.

## Themes

**Dark is the default.**

| Theme | Name | When |
| --- | --- | --- |
| Dark | **The Chamber at Night** | Default for every visitor |
| Light | The Chamber by Day | Opt-in via the theme toggle |

- The toggle remembers the visitor's choice (local storage, no cookie).
- The site starts in dark mode, regardless of the OS setting, until the visitor chooses otherwise.
- The theme is set before first paint (inline script in `<head>`) to avoid a flash of the wrong theme.

## Palette

Tokens are CSS custom properties in `packages/ui/src/styles/tokens.css`. Every text colour below
meets WCAG AA (4.5:1) against `--bg` in its theme. Re-check whenever a value changes.

| Token | Night (default) | Day | Role |
| --- | --- | --- | --- |
| `--bg` | `#14110f` deep ink-brown | `#f4ecdc` parchment | Page background |
| `--surface` | `#1d1915` | `#ebe1cc` | Cards, code blocks |
| `--text` | `#e9e1d0` candle-lit parchment | `#1e1a16` ink | Body text (14.5:1 / 14.7:1) |
| `--text-muted` | `#a39a88` | `#5c544a` | Meta, captions (6.8:1 / 6.3:1) |
| `--accent` | `#d65a52` wax-seal red | `#9e2b25` | Links, highlights, seals (4.9:1 / 6.3:1) |
| `--on-accent` | `#14110f` | `#ffffff` | Text on accent-coloured buttons |
| `--brass` | `#c9a45c` | `#76591f` | Rules, ornaments, focus rings, small labels (8.0:1 / 5.6:1) |
| `--border` | `#2e2822` | `#d6c8ab` | Dividers |

There should be one accent colour (wax-seal red), used sparingly. Brass is for ornaments and small
labels, never body text.

## Typography

All fonts are self-hosted through Fontsource packages, so no request ever goes to a font CDN.

| Role | Font | Notes |
| --- | --- | --- |
| Headings | Cormorant Garamond (600, 700) | High-contrast serif with a "proclamation" feel |
| Body | Source Serif 4 (variable) | Highly readable text serif, 19px, measure about 68 characters |
| UI and meta | System sans-serif, often in small caps | Navigation, dates, labels |
| Code | JetBrains Mono (variable) | Clear `0/O` and `1/l` distinction |

Code blocks use the `rose-pine` Shiki theme in both modes.

## Motifs

- **Pixel mascots.** Original sprite art by a commissioned artist. They appear sparingly as a
  recurring signature, not as decoration on every page.
- **Seals and rules.** Wax-seal marks for categories or tags, thin brass rules between sections, and a
  restrained use of small caps.
- **Motion:** minimal, and always respects `prefers-reduced-motion`.

## Other sites in the family

Any future project on a subdomain builds on the same technical base (`packages/ui` tokens, type scale,
spacing, components) but is free to have its own look and personality. It does not have to carry the
Council's branding.

## Accessibility

- WCAG 2.2 AA contrast in both themes (checked, not assumed)
- Visible focus styles (brass outline)
- Semantic HTML first. Vue islands must be keyboard-operable.
- Images have meaningful alt text. Decorative sprites use `aria-hidden`.
- Embed placeholders are real buttons with descriptive labels.
