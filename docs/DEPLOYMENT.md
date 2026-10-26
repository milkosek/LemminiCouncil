# Deployment

The Council site is a fully static build served by **Cloudflare Workers** (static assets, no server
code). Cloudflare recommends Workers over Pages for new projects. Every push to `main` deploys to
production. With preview builds on, other branches get their own preview URL.

> Commit `pnpm-lock.yaml`. The build uses `--frozen-lockfile`, so it fails if the lockfile is
> missing or out of date.

## Files

- `wrangler.jsonc` (repo root): tells Wrangler to upload `apps/council/dist` as static assets and to
  serve `404.html` for unknown URLs.
- `apps/council/public/_headers`: security headers and caching, copied into `dist` by the build.

## Project settings

Create the project under **Workers & Pages → Create application → Import a repository**.

| Setting | Value |
| --- | --- |
| Project name | `lemmini-council` (must match `name` in `wrangler.jsonc`) |
| Build command | `pnpm install --frozen-lockfile && pnpm test && pnpm --filter @lemmini/council build` |
| Deploy command | `npx wrangler deploy` |
| Preview command | Leave the default the dashboard fills in |
| Path | `/` (repo root, so the pnpm workspace and `wrangler.jsonc` are found) |
| Preview builds | On |
| Cloudflare Access | Off (the site is public) |

The build runs the unit tests first, including the colour-contrast checks, so a failing test stops
the deploy.

### Build variables

| Variable | Value | Why |
| --- | --- | --- |
| `NODE_VERSION` | `26` | Matches `.nvmrc` |
| `PNPM_VERSION` | `10.28.0` | Must match `packageManager` in the root `package.json` |
| `GITHUB_TOKEN` | *(optional, encrypted)* | Raises the GitHub API rate limit for the About page's repo list. Without it, requests are anonymous (60 per hour), which is plenty for a few builds a day |

## Domain

1. `lemminicouncil.org` is registered with Cloudflare Registrar (at cost, DNS in one place).
2. `wrangler.jsonc` lists `lemminicouncil.org` and `www.lemminicouncil.org` as custom domains. On
   deploy, Cloudflare creates their DNS records and HTTPS certificates.
3. **www → apex redirect:** Rules → Overview → Create rule → Redirect Rule, from the template
   "Redirect from WWW to root" (301, preserve query string). Rules run before the Worker, so
   `www` never serves pages itself.
4. Turn on **DNSSEC** (DNS → Settings) and check that WHOIS privacy (redaction) is on.
5. Either set up **Email Routing** for an address on the domain, or publish "no email" records
   (`TXT @ "v=spf1 -all"` and `TXT _dmarc "v=DMARC1; p=reject"`) so nobody can spoof it.

Until then, the site is available at `lemmini-council.<your-subdomain>.workers.dev`.

## Headers

`apps/council/public/_headers` sets security headers and long-term caching for hashed assets.

The Content-Security-Policy comes in two parts that browsers enforce together:

- A `<meta>` tag Astro adds to every page at build time (`security.csp` in `astro.config.mjs`).
  Astro hashes its own scripts and styles; everything else must come from the site itself, apart
  from the YouTube and Spotify players, which are allowed as frames.
- A `Content-Security-Policy` header in `_headers` for what a `<meta>` tag can't set
  (`frame-ancestors`).

The CSP is not applied in `pnpm dev`. Test changes with `pnpm build && pnpm preview` and watch the
browser console for "Content-Security-Policy" errors. Inline `<script>` tags will be blocked, so
put scripts in `apps/council/public/scripts/` or let Astro bundle them.

## security.txt

`apps/council/public/.well-known/security.txt` tells security researchers how to report problems
(RFC 9116). Reports go to GitHub's private vulnerability reporting, which must be switched on in
the repo (Settings → Security → Private vulnerability reporting). The file's `Expires` date must be
renewed **before 2027-10-01**, and then at least once a year.

## Dependencies and supply chain

Everything heavy (sharp, satori, Astro itself) runs only at build time; visitors get static files.
The main risk from a compromised package is to the build machine and the developer's accounts.

- **Dependabot** (`.github/dependabot.yml`): weekly grouped PRs for releases at least 5 days old
  (14 for major versions), separate PRs for security fixes. Alerts and malware alerts are on in
  the repo settings. Nothing is merged automatically; Cloudflare builds a preview for each PR.
- **pnpm** (`pnpm-workspace.yaml`): install scripts only for esbuild and sharp, and the install
  fails on any other (`strictDepBuilds`); no versions younger than 3 days (`minimumReleaseAge`);
  fail if a package's publishing trust drops (`trustPolicy`); transitive dependencies only from npm
  (`blockExoticSubdeps`).
- **Overrides** in `pnpm-workspace.yaml` patch transitive dependencies; each has a comment saying
  when it can be removed.
- Check now and then with `pnpm audit`.

## Analytics

There is **no analytics script** on the site. Cloudflare's dashboard still shows request-level
traffic (visits, countries, popular pages), counted on its servers.

Cloudflare may switch on **Web Analytics** for a new zone and inject `beacon.min.js` into every
page (the CSP then blocks it and the console shows errors). It is turned off: Analytics & Logs →
Web Analytics → add the site → Manage site → automatic setup: **Disable**. If you ever want it on,
allow `static.cloudflareinsights.com` in the CSP and update the privacy page
(`apps/council/src/pages/privacy.astro`) in the same change.

## Performance

Lighthouse on the live site (2026-10-26, Incognito so browser extensions don't skew results):
100 for Performance, Accessibility, Best Practices and SEO on both desktop and mobile.
Re-run after big changes, always in an Incognito or Guest window.

## Adding another site later

Each future app (`apps/<project>`) gets its own Worker: its own `wrangler.jsonc` (in its app folder,
with that folder as the project path), its own build filter (`pnpm --filter @lemmini/<project> build`)
and a `<project>.lemminicouncil.org` custom domain.
