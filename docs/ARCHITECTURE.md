# Architecture

## Principles

- **Static first.** Every site builds to plain HTML/CSS with as little JavaScript as possible.
- **Islands, not an SPA.** Astro renders pages. Vue 3 components hydrate only where something is
  actually interactive (`client:visible` / `client:idle`), never the whole page.
- **Room for more sites.** The repo is a monorepo, so a future project on its own subdomain can share
  the design system and components but build and deploy on its own. Adding one should be "add an app
  folder, add a Pages project".
- **No backend until a feature needs one.** When one does, it is a small Cloudflare Worker next to
  the static site, not an app server.

## Stack

| Concern | Choice | Notes |
| --- | --- | --- |
| Site framework | Astro | Content collections, MDX, sitemap, RSS |
| Interactive UI | Vue 3 via `@astrojs/vue` | Composition API, `<script setup>`, TypeScript |
| Language | TypeScript | Strict mode |
| Package manager | pnpm (workspaces) | Monorepo |
| Styling | Plain CSS + custom properties | Design tokens shared from `packages/ui` |
| Search | Pagefind | Built at build time, no server |
| Comments | giscus (GitHub Discussions) | Optional, opt-in per post |
| Embeds | Click-to-load facades | See *Third-party embeds* |
| Hosting | Cloudflare Pages | One Pages project per app |
| Analytics | Cloudflare Web Analytics | Cookie-less, aggregate only |
| Lint / format | ESLint + Prettier | Shared config in `packages/config` |

## Repository layout (target)

```
LemminiCouncil/
├── apps/
│   └── council/            # lemminicouncil.org: blog, about, portfolio
│       ├── src/
│       │   ├── content/
│       │   │   └── posts/  # Markdown / MDX posts
│       │   ├── components/ # Astro + Vue components specific to the Council
│       │   ├── layouts/
│       │   └── pages/
│       ├── public/
│       └── astro.config.mjs
├── packages/
│   ├── ui/                 # Shared design tokens (CSS), Vue components, fonts
│   └── config/             # Shared tsconfig, ESLint, Prettier
├── docs/                   # Project documentation
├── pnpm-workspace.yaml
└── package.json
```

Future projects go in `apps/<project>/` when they are needed, not before.

## Domains and hosting

| App | Domain | Cloudflare Pages project |
| --- | --- | --- |
| `apps/council` | `lemminicouncil.org` (+ `www` redirect) | `lemmini-council` |
| `apps/<project>` | `<project>.lemminicouncil.org` | `<project>` |

- DNS lives in Cloudflare. Each subdomain is a custom domain on its own Pages project.
- Each Pages project builds only its own app (`pnpm --filter <app> build`). Build watch paths keep a
  change in one app from redeploying the others.
- Preview deployments come for free on every branch and PR.

## Content model (Council blog)

Posts live in `apps/council/src/content/posts/` as `.md` or `.mdx`, and are validated by an Astro
content collection schema:

```ts
// apps/council/src/content.config.ts (sketch)
posts: {
  title: string
  description: string        // used for meta tags, OG image and listings
  published: Date
  updated?: Date
  tags: string[]
  series?: string
  draft: boolean             // drafts build locally, never in production
  heroImage?: image
}
```

The file name becomes the slug: `posts/dark-patterns-are-a-choice.md` → `/posts/dark-patterns-are-a-choice/`.

### Build-time features

- RSS feed (`/rss.xml`) and sitemap
- Open Graph images generated per post at build time
- Reading time, tag pages, series navigation
- Pagefind search index
- GitHub profile and recent repositories fetched at build time for the portfolio page (no runtime API calls)

## Third-party embeds (YouTube, Spotify, …)

Embeds work fine on a static site, since they are just iframes. The catch is that a normal YouTube or
Spotify iframe loads the provider's scripts and trackers as soon as the page opens, before the visitor
has done anything. That would break the site's own promise.

So every embed is a **click-to-load facade**:

1. At build time, the page renders a lightweight placeholder: a self-hosted thumbnail or cover image
   (fetched during the build, not from the provider at runtime), the title, and a clear button such as
   "Play on YouTube" or "Load Spotify player".
2. Next to the button, one short line says that loading the player connects to YouTube/Spotify.
3. Only when the visitor clicks does a small Vue island swap in the real iframe. YouTube uses the
   `youtube-nocookie.com` domain. Spotify has no equivalent, so the click is the consent.
4. Without JavaScript, the placeholder is a plain link to the video or track on the provider's site.

Components: `<YouTubeEmbed id="…" />` and `<SpotifyEmbed uri="…" />` in `packages/ui`, usable in MDX.

Plain links (a "Listen on Spotify" button, a YouTube channel link) need none of this. They are just
links.

## Writing workflow

Git is the CMS: write Markdown, open a PR, check the preview deployment, merge. A Git-backed editor
such as Keystatic can be added later for writing on the go without adding a backend.

## Quality bar

- Lighthouse 95+ on every category for the Council home page and a typical post
- Works and reads well with JavaScript disabled
- WCAG 2.2 AA colour contrast in both themes
- No third-party requests on page load. Embeds connect only after a click.
