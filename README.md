# Lemmini Council

> The council of Lemmings has spoken.

This is the source code for **[lemminicouncil.org](https://lemminicouncil.org)**, a blog about ethics in
software and business. It's written by a software engineer who has to make these calls at work, not
just think about them.

Popular isn't the same as right. The Council's job is to stop and work out which is which.

## What's on the site

- **Essays and case studies** on the ethics of building software: dark patterns, data, AI and the
  business decisions behind them
- **About and portfolio**, with links to GitHub and LinkedIn
- **A home base** for future personal projects

## Status

Early days. The site scaffold is in place, and the first posts are being written.

## Built with

- [Astro](https://astro.build): static pages, with posts written in Markdown/MDX
- [Vue 3](https://vuejs.org): only for the parts that need to be interactive
- TypeScript in a pnpm workspaces monorepo
- Cloudflare Pages for hosting

The site follows its own advice: no trackers, no dark patterns, and it reads fine without JavaScript.

## Getting started

You need Node 26 (see `.nvmrc`; any even-numbered version from 22.23.4 works) and pnpm 10.
Node 25+ no longer ships Corepack, so install pnpm with `npm install -g pnpm@10`. Windows, macOS and Linux all work.

```sh
pnpm install
pnpm dev          # http://localhost:4321, drafts included
pnpm build        # production build + search index
pnpm preview      # serve the production build locally
pnpm check        # type-check
pnpm test         # unit tests, including WCAG contrast checks for the theme colours
pnpm lint         # ESLint
pnpm format       # Prettier
```

Posts live in `apps/council/src/content/posts/`. Set `draft: true` in a post's frontmatter to keep
it out of production.

## Repository layout

```
apps/council/     lemminicouncil.org
packages/ui/      shared design tokens, styles and Vue/Astro components
packages/config/  shared TypeScript and ESLint config
docs/             project documentation
```

## Documentation

- [Vision](docs/VISION.md): why this exists and where it's going
- [Architecture](docs/ARCHITECTURE.md): repo layout, stack, hosting and content model
- [Design](docs/DESIGN.md): the visual identity, "The Council Chamber at Night"
- [Deployment](docs/DEPLOYMENT.md): Cloudflare Pages setup

## Licence

- **Code:** [Apache License 2.0](LICENSE)
- **Writing** (posts and page text): [CC BY 4.0](CONTENT-LICENSE.md). Share and adapt it freely, with credit.
