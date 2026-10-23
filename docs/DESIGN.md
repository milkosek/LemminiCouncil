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

## Palette (starting point)

Tokens are CSS custom properties in `packages/ui`. These values are placeholders until tested for
contrast.

| Token | Night (default) | Day | Role |
| --- | --- | --- | --- |
| `--bg` | `#14110f` deep ink-brown | `#f4ecdc` parchment | Page background |
| `--surface` | `#1d1915` | `#ebe1cc` | Cards, code blocks |
| `--text` | `#e9e1d0` candle-lit parchment | `#1e1a16` ink | Body text |
| `--text-muted` | `#a39a88` | `#5c544a` | Meta, captions |
| `--accent` | `#c2413a` wax-seal red | `#9e2b25` | Links, highlights, seals |
| `--brass` | `#c9a45c` | `#8a6a2a` | Rules, ornaments, focus rings |
| `--border` | `#2e2822` | `#d6c8ab` | Dividers |

There should be one accent colour (wax-seal red), used sparingly. Brass is for ornaments, never body
text.

## Typography

- **Headings:** a characterful serif with high contrast, for a "proclamation" feel.
- **Body:** a highly readable text serif, roughly 18–20px, with a measure of about 65–70 characters.
- **UI and meta:** a quiet sans-serif or a small-caps variant of the body face.
- **Code:** a monospace with clear `0/O` and `1/l` distinction.
- All fonts are self-hosted (no Google Fonts requests at runtime) and subset where possible.

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
