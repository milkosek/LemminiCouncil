# Architecture

## Principles

- **Static first.** Every site builds to plain HTML/CSS with as little JavaScript as possible.
- **Islands, not an SPA.** Astro renders pages. Small bundled scripts or Vue islands run only where
  something is actually interactive, never the whole page.
- **Nothing third-party on page load.** Fonts, images and scripts come from this site. Players and
  comments from other services load only after the visitor asks for them.
- **Room for more sites.** The repo is a monorepo, so a future project on its own subdomain can
  share the design system and components but build and deploy on its own: "add an app folder, add
  a Worker".
- **No backend until a feature needs one.** When one does, it is a small Cloudflare Worker next to
  the static site, not an app server.

## Stack

| Concern | Choice | Notes |
| --- | --- | --- |
| Site framework | Astro 7 | Content collections, MDX, sitemap, RSS |
| Interactive UI | Small bundled scripts; Vue 3 islands for the embed player | Vue loads only on posts with embeds |
| Language | TypeScript | Strict mode |
| Package manager | pnpm 10 (workspaces) | Supply-chain settings in `pnpm-workspace.yaml` |
| Styling | Plain CSS + custom properties | Design tokens in `packages/ui` |
| Search | Pagefind | Index built after `astro build`, runs in the browser, no server |
| Social preview images | Satori + sharp | 1200×630 PNG per post, generated at build time |
| Embeds | Click-to-load facades | See *Third-party embeds* |
| Comments | giscus (GitHub Discussions), click-to-load | See *Comments* |
| Hosting | Cloudflare Workers (static assets only) | `wrangler.jsonc`; see DEPLOYMENT.md |
| Analytics | None in the page | Cloudflare's server-side request stats only |
| Tests | Vitest | Includes WCAG contrast checks for the theme colours |
| Lint / format | ESLint 10 + Prettier | Shared ESLint config in `packages/config` |

## Repository layout

```
LemminiCouncil/
├── apps/
│   └── council/                  # lemminicouncil.org
│       ├── public/
│       │   ├── _headers          # security headers and caching (Cloudflare)
│       │   ├── .well-known/security.txt
│       │   ├── humans.txt, robots.txt, favicon.svg
│       │   ├── giscus/           # comment themes (night.css, day.css)
│       │   └── scripts/          # theme-init.js, search-init.js (CSP-friendly, no inline scripts)
│       ├── src/
│       │   ├── content/posts/    # Markdown / MDX posts
│       │   ├── components/       # header, footer, post lists, series nav, comments, easter eggs
│       │   ├── layouts/          # BaseLayout (head, meta, CSP-safe scripts), PostLayout
│       │   ├── lib/              # posts & series helpers, GitHub fetch, OG card renderer, ASCII art
│       │   ├── pages/            # routes, incl. og/[...slug].png.ts and series/
│       │   ├── content.config.ts # post schema
│       │   └── site.config.ts    # title, author, links, repo, comments settings
│       └── astro.config.mjs      # integrations, images, CSP
├── packages/
│   ├── ui/                       # design tokens, base styles, fonts, ThemeToggle, embeds
│   └── config/                   # shared tsconfig and ESLint config
├── docs/                         # this documentation (docs/private is local-only)
├── .github/dependabot.yml
├── wrangler.jsonc                # Cloudflare Worker: static assets + custom domains
├── giscus.json                   # where the comments may load (read by giscus from GitHub)
├── pnpm-workspace.yaml
└── package.json
```

Future projects go in `apps/<project>/` when they are needed, not before.

## Domains and hosting

| App | Domain | Cloudflare Worker |
| --- | --- | --- |
| `apps/council` | `lemminicouncil.org` (+ `www` redirected to it) | `lemmini-council` |
| `apps/<project>` | `<project>.lemminicouncil.org` | `<project>` |

- DNS lives in Cloudflare. Custom domains are declared in each app's `wrangler.jsonc`.
- Every push to `main` builds and deploys. Other branches aren't built or deployed.
- Details, settings and security headers: [DEPLOYMENT.md](DEPLOYMENT.md).

## Content model (Council blog)

Posts live in `apps/council/src/content/posts/` as `.md` or `.mdx`, validated by
`src/content.config.ts`:

```ts
posts: {
  title: string
  description: string     // 100–160 characters; the build warns otherwise
  published: Date
  updated?: Date
  tags: string[]          // default []
  series?: string         // posts with the same name form a series
  seriesOrder?: number    // position in the series; otherwise ordered by date
  comments: boolean       // default true; false hides comments on this post
  draft: boolean          // default false; drafts show in `pnpm dev` only
  heroImage?: image       // optional banner; see *Images in posts*
  heroImageAlt?: string   // required with heroImage ("" if decorative)
}
```

The file name becomes the slug: `posts/dark-patterns-are-a-choice.md` →
`/posts/dark-patterns-are-a-choice/`.

### Series

Give posts the same `series` name (and optionally `seriesOrder: 1`, `2`, …) and the site adds:

- a "Part 2 of 4 in the series …" box at the top of each part, which expands to the full list
- previous / next part links at the end of each part
- `/series/` (all series) and `/series/<name>/` (the parts in order)
- a **Series** link in the main menu, shown only once at least one series is published

### Build-time features

- RSS feed (`/rss.xml`) and sitemap
- Open Graph / Twitter images per post (`/og/posts/<id>.png`) and for the site (`/og/site.png`)
- Reading time, tag pages, series pages and navigation
- Pagefind search index
- GitHub repositories for the About page (fetched once per build, not by visitors)
- Embed thumbnails and cover art downloaded and optimised, so visitors load them from this site
- A warning for published posts whose description isn't 100–160 characters

## JavaScript that reaches visitors

Kept small on purpose, and all served from this site:

| Script | Where | What it does |
| --- | --- | --- |
| `public/scripts/theme-init.js` | every page, before paint | applies a saved day theme (page and `theme-color`) |
| ThemeToggle (bundled) | every page | the night/day button; also updates `theme-color` |
| EasterEggs (bundled) | every page | console greeting, Konami code |
| Comments (bundled) | posts | builds the giscus frame after a click |
| Vue + ClickToLoad island | posts with embeds | swaps in the player after a click |
| Pagefind + `search-init.js` | `/search/` | the search box |

## Third-party embeds (YouTube, Spotify)

A normal YouTube or Spotify iframe loads the provider's scripts and trackers as soon as the page
opens. So every embed is a **click-to-load facade** (`ClickToLoad.vue` in `packages/ui`):

1. At build time the page renders a placeholder: a self-hosted thumbnail or cover image, the title,
   and a button ("Play on YouTube", "Load Spotify player"), plus one line saying that playing
   connects to the provider.
2. Only after the click does the real iframe load. YouTube uses `youtube-nocookie.com`; Spotify has
   no equivalent, so the click is the consent.
3. Without JavaScript, the placeholder is a plain link to the provider's page.

Usage in MDX (import the components at the top of the post):

```mdx
<YouTubeEmbed id="VIDEO_ID" />
<SpotifyEmbed url="https://open.spotify.com/track/TRACK_ID" />
<SpotifyEmbed url="https://open.spotify.com/track/TRACK_ID" size="large" />
<SpotifyEmbed url="https://open.spotify.com/playlist/PLAYLIST_ID" size={600} />
```

Spotify sizes: `compact` (152px, default for tracks), `large` (352px, default for albums and
playlists), or a height in pixels (only useful for albums and playlists).

A wrong video ID or Spotify link doesn't break the build. The build logs an `[embeds]` warning
(`pnpm dev` shows it in the terminal) and the placeholder renders without a thumbnail, so check
for warnings when previewing a post with embeds.

## Comments

Comments are **GitHub Discussions**, shown under each post through [giscus](https://giscus.app).
Each post maps to one discussion (by post id), created automatically on the first comment.

- **Click-to-load:** a "Load comments" button; nothing contacts GitHub or giscus before that.
- **No third-party script:** `Comments.astro` builds the giscus iframe itself instead of loading
  giscus' `client.js`, so the CSP only allows `https://giscus.app` as a frame.
- **Theme:** our own, in the site's colours: `public/giscus/night.css` and `day.css`, switched
  with the site's toggle. The giscus iframe loads them from the live site (it can't reach the dev
  server), so a change to them shows only after it's deployed, in `pnpm dev` too. `_headers`
  lets giscus.app fetch them (CORS). Keep their colours in step with `tokens.css`.
- **Allowed sites:** `giscus.json` in the repo root lets giscus load only on lemminicouncil.org and
  `localhost` (for checking locally; a comment posted there is a real comment). The workers.dev
  address and any other copy of the site get an error instead. giscus reads the file from the
  default branch on GitHub, so changes apply once pushed.
- **Sign-in:** giscus signs people in with GitHub and keeps a token in this site's local storage.
- **Without JavaScript:** a link to the repo's Discussions.
- **Per post:** `comments: false` in the frontmatter hides the section. Drafts never show it, so
  no public discussion is created for an unpublished post.

### Turning comments on

The section stays hidden until `site.comments` in `apps/council/src/site.config.ts` is complete:

1. In the GitHub repo, **Settings → General → Features → Discussions** (tick).
2. In **Discussions**, create a category called **Comments**, type **Announcement** (only
   maintainers and giscus can start discussions there, so readers comment rather than open topics).
3. Install the giscus GitHub app on the repo: <https://github.com/apps/giscus>.
4. On <https://giscus.app>, enter `milkosek/LemminiCouncil`, choose the **Comments** category and
   copy `data-repo-id` and `data-category-id` from the generated snippet into `site.config.ts`
   (`repoId`, `categoryId`). The other options on that page don't matter: the site sets them.

Posting needs a GitHub account: giscus has no anonymous or guest comments.

## Images in posts

Put a post's pictures in `apps/council/src/content/posts/images/<post-id>/` and reference them with
a path relative to the post file. Astro checks the file exists, then resizes, converts (WebP) and
fingerprints it at build time, so a missing or misspelt image fails the build instead of shipping a
broken picture.

**In the text** (Markdown or MDX):

```md
![A crowd of lemmings walking left, one walking right](./images/my-post/crowd.jpg)
```

Every picture needs alt text that says what it shows. Leave it empty (`![](…)`) only for purely
decorative images. For more control in MDX (several widths, a caption), import `Image` from
`astro:assets`, import the file, and use `<Image src={crowd} alt="…" />` inside a `<figure>`.

**Banner (hero image):** optional, in the frontmatter:

```yaml
heroImage: ./images/my-post/banner.jpg
heroImageAlt: An empty council chamber at night, lit by one lamp
```

- Shown above the title, as wide as the home page hero on large screens and as wide as the text
  on phones. Loaded eagerly (it's usually the largest thing on screen), in several sizes so phones
  download a small version.
- Wide pictures work best: about 2:1, at least 2000px across. Avoid text in the image.
- `heroImageAlt` is required with a banner (the build stops without it). Use `""` if the banner
  is purely decorative.
- The social preview card (`/og/posts/<id>.png`) stays the generated text card.

Don't put post images in `public/`: those are served as they are, without resizing or checks.

## Security on the page

- **CSP** (`astro.config.mjs`): scripts, styles, fonts, images and requests only from this site;
  frames only from YouTube's privacy-mode domain, Spotify and giscus; inline style attributes allowed
  (code highlighting, embed sizing), inline scripts not. `frame-ancestors` and HSTS are headers in
  `public/_headers`.
- **Supply chain:** see DEPLOYMENT.md → *Dependencies and supply chain*.

## Easter eggs

- A greeting in the DevTools console (seal, links to the repo, `humans.txt`, `security.txt`).
- An ASCII banner as an HTML comment at the top of every page.
- `/humans.txt`.
- An ASCII scene on the 404 page.
- The Konami code (↑ ↑ ↓ ↓ ← → ← → B A): "Order! Order!" and a lemming walking the other way.

ASCII art lives in `apps/council/src/lib/ascii.ts`.

## Writing workflow

Git is the CMS: write Markdown, check it with `pnpm dev` (or `pnpm build && pnpm preview`), push
to `main`. A Git-backed editor such as Keystatic can be added later for writing on the go without
adding a backend.

## Quality bar

- Lighthouse 95+ in every category, desktop and mobile (currently 100 across the board)
- Works and reads well with JavaScript disabled
- WCAG 2.2 AA colour contrast in both themes, enforced by unit tests
- No third-party requests on page load
