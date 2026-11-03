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
- The theme is set before first paint (`public/scripts/theme-init.js`, loaded as a small blocking
  file in `<head>` rather than inline, for the CSP) to avoid a flash of the wrong theme.
- The toggle is a plain Astro component with a few lines of script (no framework), and it reserves
  its space so nothing shifts when it appears.
- `<meta name="theme-color">` (the browser toolbar colour on phones) follows the theme: `--bg` of
  each theme, set by `theme-init.js` on load and by the toggle on click. Change all three together.

## Palette

Tokens are CSS custom properties in `packages/ui/src/styles/tokens.css`. Every text colour below
meets WCAG AA (4.5:1) against `--bg` in its theme. Unit tests
(`packages/ui/src/styles/tokens.test.ts`) check every text/background pair in both themes, and the
build runs them before every deploy.

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
| Body | Source Serif 4 (variable) | Text serif, 18px on phones to 21px on wide screens |
| UI and meta | System sans-serif, often in small caps | Navigation, dates, labels |
| Code | JetBrains Mono (variable) | Clear `0/O` and `1/l` distinction |

Code blocks use the `rose-pine` Shiki theme in both modes.

## Layout

- One centred reading column of about 70 characters, with equal space on both sides.
- Code blocks and tables stay in the column; long code lines scroll sideways.
- Only the home-page heading and the About page's repo cards may grow wider (`.breakout`).
- The footer sits at the bottom of short pages and is pushed down by long ones.
- External links get a small ↗ (hidden from screen readers) and open in the same tab.

## Social preview cards

Generated per post at build time (`apps/council/src/lib/og.ts`), 1200×630: wax-seal red bar on top,
the "LC" seal and LEMMINI COUNCIL in brass, the title in Cormorant, the description in Source Serif,
and a brass rule with the date and `lemminicouncil.org`. No artwork needed; the commissioned sprites
can be added to the template later.

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
- Semantic HTML first. Interactive parts must be keyboard-operable.
- ASCII art (404 page, Konami lemming) is `aria-hidden`; motion is skipped for reduced-motion users.
- Images have meaningful alt text. Decorative sprites use `aria-hidden`.
- Embed placeholders are real buttons with descriptive labels.
