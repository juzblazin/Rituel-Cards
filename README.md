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
```

## Environment

Copy `.env.example` to `.env.local` and fill in what you need. Every integration is optional: with nothing set, the directory renders from seed data and the API routes fall back to logging, so `npm run dev` works out of the box.

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap and outbound links | `http://localhost:3000` |
| `NEXT_PUBLIC_GA_ID` | Optional GA4 measurement ID | unset |
| `ANALYTICS_WEBHOOK_URL` | Optional webhook that receives affiliate click events | unset |
| `SUBMISSIONS_WEBHOOK_URL` | Optional webhook that receives issuer submissions | unset |

On Vercel, set these in **Project → Settings → Environment Variables** rather than committing a file.

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
| `EMAIL_NOTIFY_TO` | Comma-separated notification recipients | `hello@rituel.io` |

Create a key at [resend.com/api-keys](https://resend.com/api-keys) and verify your domain under **Domains**. Until a domain is verified, `onboarding@resend.dev` can only deliver to the address on your own Resend account — fine for a first test, not for production. The free tier allows 3,000 emails per month, 100 per day.

Resend is email only and has no SMS product. Text-message notifications need a separate provider.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Hero, directory, calculator and editorial hub |
| `/cards` / `/cards/[attribute]` | Programmatic guide pages (no-KYC, self-custody, cashback, …) |
| `/countries` / `/countries/[country]` | Country availability directory |
| `/crypto` / `/crypto/[token]` | Token and chain programme pages |
| `/compare` / `/compare/[a]-vs-[b]` | Head-to-head comparison matrix |
| `/card/[slug]` | Card review, fee table, tiers, FAQ and earnings estimator |
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
