# RItuel

Crypto card comparison and directory platform. Built with Next.js 15 (App Router), React 19, Tailwind CSS v4 and the shadcn/ui component primitives from [shadcn-dashboard-landing-template](https://github.com/shadcnstore/shadcn-dashboard-landing-template).

## Stack

- **Framework:** Next.js 15.5 (App Router, Server Components, route handlers)
- **Styling:** Tailwind CSS v4 with shadcn CSS variables (`background`, `foreground`, `card`, `muted`, `primary`, `success`, …)
- **UI primitives:** `@base-ui/react` + shadcn copies in `src/components/ui/`
- **Icons:** lucide-react
- **Data:** Neon Postgres — the `cards` / `card_tiers` catalog (snapshotted at build time) plus leads and click events
- **Storage:** Cloudflare R2 (`src/lib/storage.ts`)
- **Email:** Resend (`src/lib/email.ts`)

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run typecheck  # tsc --noEmit
npm run build      # production build (174 static pages)
npm run start      # serve the production build
npm run lint
npm run preview    # build for Cloudflare Workers and run it locally (http://localhost:8787)
npm run deploy     # build for Cloudflare Workers and deploy
```

## Deploying to Cloudflare Workers

The site runs on Workers through [OpenNext for Cloudflare](https://opennext.js.org/cloudflare) (`@opennextjs/cloudflare`). Two files in the repo root configure it:

- [wrangler.jsonc](wrangler.jsonc) — the Worker: name (`rituel`), entry point (`.open-next/worker.js`), static assets and compatibility flags.
- [open-next.config.ts](open-next.config.ts) — how OpenNext serves Next.js. It uses the static-assets incremental cache, so the pages pre-rendered at build time (including the `dynamicParams = false` routes under `/countries`, `/crypto` and `/cards`) are served from the deployed assets. Without an incremental cache those routes 404 with `NoFallbackError`.

Always build, preview and deploy with the `opennextjs-cloudflare` CLI (the `npm run preview` / `npm run deploy` scripts), not plain `wrangler dev` / `wrangler deploy`: only the OpenNext CLI uploads the pre-rendered page cache.

`npm run cf:build` passes `--dangerouslyUseUnsupportedNextVersion` because `@opennextjs/cloudflare` refuses Next.js 15 now that it is past the Next.js support window. Without the flag the build prints an error and **exits 0 without producing a Worker**, so a CI run looks green but deploys nothing. Drop the flag after upgrading to Next.js 16.

### First deploy from your Mac

1. Install Node.js 20 or newer (`node -v` to check; install from [nodejs.org](https://nodejs.org) or `brew install node`).
2. Install dependencies: `npm install`.
3. Log in to Cloudflare (opens a browser window): `npx wrangler login`. Check with `npx wrangler whoami`.
4. Optional — try it locally first: `npm run preview`, then open http://localhost:8787. For local secrets, put them in a `.dev.vars` file (same `KEY=value` format as `.env.local`, gitignored).
5. Deploy: `npm run deploy`. Wrangler prints the URL, e.g. `https://rituel.<your-subdomain>.workers.dev`.
6. Add the server-side secrets (each command prompts for the value and applies it to the live Worker — no rebuild needed):

   ```bash
   npx wrangler secret put DATABASE_URL
   npx wrangler secret put RESEND_API_KEY
   npx wrangler secret put R2_ACCOUNT_ID
   npx wrangler secret put R2_BUCKET_NAME
   npx wrangler secret put R2_ACCESS_KEY_ID
   npx wrangler secret put R2_SECRET_ACCESS_KEY
   # optional: R2_PUBLIC_BASE_URL, EMAIL_FROM, EMAIL_NOTIFY_TO,
   #           ANALYTICS_WEBHOOK_URL, SUBMISSIONS_WEBHOOK_URL
   ```

   Or set them in the dashboard under **Workers & Pages → rituel → Settings → Variables and Secrets**.
7. Custom domain: **Workers & Pages → rituel → Settings → Domains & Routes → Add → Custom domain**, e.g. `rituel.xyz` (the domain's DNS must be on Cloudflare).

`NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_GA_ID` are inlined by Next.js **at build time**, so set them where the build runs (your shell or `.env.local` for `npm run deploy`, or the build variables below), not as Worker secrets. `DATABASE_URL` is also read at build time by `prebuild` to refresh the card snapshot.

### Automatic deploys from GitHub (Workers Builds)

In **Workers & Pages → Create → Import a repository**, pick this repo, then under **Build configuration**:

| Setting | Value |
| --- | --- |
| Build command | `npm run cf:build` |
| Deploy command | `npx opennextjs-cloudflare deploy` |
| Non-production branch deploy command | `npx opennextjs-cloudflare upload` |
| Build variables | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_ID`, `DATABASE_URL` |

The project name must match `name` in `wrangler.jsonc` (`rituel`). Runtime secrets still go under the Worker's **Variables and Secrets** as in step 6.

### Troubleshooting

- **Build "succeeds" but nothing deploys / `Next.js version … is not supported`** — run the build through `npm run cf:build` so the flag is passed.
- **`/countries/…`, `/crypto/…` or `/cards/…` return 404 on Workers** — the page cache was not uploaded; deploy with `npx opennextjs-cloudflare deploy`, not `wrangler deploy`.
- **Submissions or clicks only show up in logs** — the runtime secrets are missing; check **Settings → Variables and Secrets**, and **Observability → Logs** for errors.
- **`env.IMAGES binding is not defined` warning** — harmless: `next/image` serves the original image. Add an `"images": { "binding": "IMAGES" }` entry to `wrangler.jsonc` to resize through Cloudflare Images (billed beyond its free tier).

## Environment

Copy `.env.example` to `.env.local` and fill in what you need. Every integration is optional: with nothing set, the directory renders from seed data and the API routes fall back to logging, so `npm run dev` works out of the box.

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap and outbound links | `http://localhost:3000` |
| `NEXT_PUBLIC_GA_ID` | Optional GA4 measurement ID | unset |
| `ANALYTICS_WEBHOOK_URL` | Optional webhook that receives affiliate click events | unset |
| `SUBMISSIONS_WEBHOOK_URL` | Optional webhook that receives issuer submissions | unset |

On Vercel, set these in **Project → Settings → Environment Variables** rather than committing a file. On Cloudflare Workers, see [Deploying to Cloudflare Workers](#deploying-to-cloudflare-workers).

### Neon Postgres — database

Issuer leads and affiliate clicks are stored in Postgres through Neon's HTTP driver (`@neondatabase/serverless`). It holds no TCP connection between invocations, so serverless scaling cannot exhaust pooled connections, and it runs unchanged on both Node functions and Cloudflare's workerd.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled connection string (host contains `-pooler`) — application traffic |
| `DATABASE_URL_UNPOOLED` | Direct connection — schema changes, dumps and replication |

The project is linked in `.neon` and its services are declared in [neon.ts](neon.ts). After checking out a branch, reconcile the policy and pull credentials:

```bash
neon deploy     # apply neon.ts to the linked branch, then pull its env into .env.local
neon env pull   # credentials only
```

Apply the schema once over the direct connection — transaction-mode pooling does not hold a session, and schema changes want one:

```bash
neon psql -- -f db/schema.sql                    # CLI's embedded psql
psql "$DATABASE_URL_UNPOOLED" -f db/schema.sql   # local psql
```

Or paste [db/schema.sql](db/schema.sql) into the Neon SQL Editor. It is idempotent, so re-running it is safe. Tables: `card_submissions` (written by `/api/submit-card`) and `affiliate_clicks` (written by `/api/track`).

The card catalog has its own file, [db/cards-schema.sql](db/cards-schema.sql), which is idempotent the same way:

```bash
psql "$DATABASE_URL_UNPOOLED" -f db/cards-schema.sql
```

### Card catalog — adding and editing cards

Postgres is the source of truth for the directory: `cards` holds one row per card and `card_tiers` holds its tiers (1:N, ordered by `tier_order`). The site pre-renders every page, so it reads a committed snapshot rather than querying per request:

```bash
npm run db:import  # load db/import/cards.csv into Postgres, then sync
npm run db:sync    # Postgres -> src/lib/cards.generated.json (the snapshot the app imports)
npm run db:seed    # load db/seed-cards.json into an empty table
```

`npm run build` runs `db:sync` first through `prebuild`, so a deploy always ships the current table.

To change a card, update the row and re-sync:

1. Edit the row(s) in the Neon SQL Editor or studio (`update cards set tagline = … where slug = 'nexo-card'`), or insert a new card plus its `card_tiers` rows — or put the whole catalog in a CSV and run `npm run db:import` (it upserts on `slug`, validates every column, then syncs).
2. Run `npm run db:sync` — the dev server picks the new values up. For production, rebuild and redeploy (which syncs again anyway).

Every column, allowed value and blank-field fallback is documented in [db/DATA-GUIDE.md](db/DATA-GUIDE.md), with spreadsheet templates in `db/templates/`.

`db:sync` keeps the existing snapshot when `DATABASE_URL` is unset or the table is empty, so a clone without a database still builds. The row shape is typed in [src/lib/cards-schema.ts](src/lib/cards-schema.ts), and rows are mapped onto the UI's `Card` shape by [src/lib/cards-db.ts](src/lib/cards-db.ts) — the one place to touch when a column changes.

### Cloudflare R2 — object storage

Uploads are signed with SigV4 through `aws4fetch` in [src/lib/storage.ts](src/lib/storage.ts). Prefer `createUploadUrl()` and let the browser PUT straight to R2 — the bytes never pass through a serverless function — and use `putObject()` only for small server-side writes.

| Variable | Purpose |
| --- | --- |
| `R2_ACCOUNT_ID` | Cloudflare account ID (the suffix of `dash.cloudflare.com/<id>`) |
| `R2_BUCKET_NAME` | Bucket name |
| `R2_ACCESS_KEY_ID` | R2 API token access key ID |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret |
| `R2_PUBLIC_BASE_URL` | Optional public bucket or custom domain, returned by `publicUrl()` |

Create a bucket under **R2 → Create bucket**, then **Manage in API Tokens** and issue a token with **Object Read & Write** scoped to that bucket. For browser uploads, add a CORS policy on the bucket allowing the app origin with `PUT` and the `Content-Type` header. A presigned URL is a bearer token, so keep the expiry short (15 minutes is the default here); the assigned content type must match what the browser sends.

### Resend — transactional email

A card submission emails the team inbox, with the submitter's address as `Reply-To`.

| Variable | Purpose | Default |
| --- | --- | --- |
| `RESEND_API_KEY` | Resend API key | unset |
| `EMAIL_FROM` | Sender, as `Name <you@yourdomain.com>` | `RItuel <onboarding@resend.dev>` |
| `EMAIL_NOTIFY_TO` | Comma-separated notification recipients | `hello@rituel.xyz` |

Create a key at [resend.com/api-keys](https://resend.com/api-keys) and verify your domain under **Domains**. Until a domain is verified, `onboarding@resend.dev` can only deliver to the address on your own Resend account — fine for a first test, not for production. The free tier allows 3,000 emails per month, 100 per day.

Resend is email only and has no SMS product. Text-message notifications need a separate provider.

### Sanity — blog

Blog posts live in [Sanity](https://www.sanity.io). The site only reads published posts over Sanity's CDN, so no token is needed. `/blog`, each post, the sitemap and the RSS feed are rendered per request, so a newly published post appears within about a minute without a redeploy. With no project ID set, `/blog` shows a "coming soon" state and post URLs return 404.

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID (not secret) | unset |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset name | `production` |

The editor (Sanity Studio) is a separate app in `studio/`, hosted free by Sanity at `https://<name>.sanity.studio`, so it adds nothing to the Cloudflare Worker bundle.

1. Sign up at [sanity.io](https://www.sanity.io), create a project on the free plan, and copy its **Project ID** from [sanity.io/manage](https://www.sanity.io/manage). Keep the dataset named `production` and its visibility **Public**.
2. Add `NEXT_PUBLIC_SANITY_PROJECT_ID` to `.env.local`, to Vercel, and to the Cloudflare Workers build variables. Redeploy once.
3. Deploy the Studio from your Mac:
   ```sh
   cd studio
   cp .env.example .env        # then paste the Project ID into .env
   npm install
   npx sanity login
   npm run deploy              # asks for a studio hostname, e.g. rituel
   ```
4. Open `https://<hostname>.sanity.studio`, create an author and a category, then write and **Publish** a post.

Run the Studio locally with `npm run dev` inside `studio/` (http://localhost:3333). Content types are in `studio/schemaTypes/`.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Hero, directory, calculator and editorial hub |
| `/cards` / `/cards/[attribute]` | Programmatic guide pages (no-KYC, self-custody, cashback, …) |
| `/countries` / `/countries/[country]` | Country availability directory |
| `/crypto` / `/crypto/[token]` | Token and chain programme pages |
| `/compare` / `/compare/[a]-vs-[b]` | Head-to-head comparison matrix |
| `/card/[slug]` | Card review, fee table, tiers, FAQ and earnings estimator |
| `/blog` / `/blog/[slug]` / `/blog/category/[category]` | Blog from Sanity, with RSS at `/blog/rss.xml` |
| `/submit-card` | B2B listing and sponsorship portal |
| `/go/[slug]` | Cloaked affiliate redirect + click event |
| `/methodology`, `/privacy`, `/terms` | Trust and legal pages |

## Data and disclaimers

Cards are rows in Neon (`cards` + `card_tiers`), snapshotted into `src/lib/cards.generated.json` by `npm run db:sync`. The content is realistic but not a live feed. Every listing, fee and availability claim must be verified against the issuer before launch. Sponsored placement is labelled and never changes scores, fee values or calculator outputs.

## Design system notes

- Tokens live in `src/app/globals.css`; no Tailwind config file is required (v4 CSS-first).
- Reusable UI primitives live in `src/components/ui/`. Use `ButtonLink` for link-styled buttons in server components.
- `src/components/ui.tsx` holds the shared `Badge`, `CardArt`, `Rating`, `Stars`, `Wordmark` and layout helpers.
- The directory keeps filter, sort, view and compare state in the URL so shortlists are shareable.

## Tracking

Affiliate clicks post to `/api/track` and are redirected through `/go/[slug]`. Country detection reads the geo header set by the hosting proxy; without one the directory shows global availability.
