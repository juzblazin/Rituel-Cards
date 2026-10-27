# RItuel

Crypto card comparison and directory platform. Built with Next.js 15 (App Router), React 19, Tailwind CSS v4 and the shadcn/ui component primitives from [shadcn-dashboard-landing-template](https://github.com/shadcnstore/shadcn-dashboard-landing-template).

## Stack

- **Framework:** Next.js 15.5 (App Router, Server Components, route handlers)
- **Styling:** Tailwind CSS v4 with shadcn CSS variables (`background`, `foreground`, `card`, `muted`, `primary`, `success`, …)
- **UI primitives:** `@base-ui/react` + shadcn copies in `src/components/ui/`
- **Icons:** lucide-react
- **Data:** local TypeScript seed data in `src/lib/data.ts`

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

Copy `.env.example` if present, or set these locally:

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap and outbound links | `http://localhost:3000` |
| `NEXT_PUBLIC_GA_ID` | Optional GA4 measurement ID | unset |
| `ANALYTICS_WEBHOOK_URL` | Optional webhook that receives affiliate click events | unset |
| `SUBMISSIONS_WEBHOOK_URL` | Optional webhook that receives issuer submissions | unset |

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

`src/lib/data.ts` contains illustrative seed data for 24 cards. It is realistic but not a live feed. Every listing, fee and availability claim must be verified against the issuer before launch. Sponsored placement is labelled and never changes scores, fee values or calculator outputs.

## Design system notes

- Tokens live in `src/app/globals.css`; no Tailwind config file is required (v4 CSS-first).
- Reusable UI primitives live in `src/components/ui/`. Use `ButtonLink` for link-styled buttons in server components.
- `src/components/ui.tsx` holds the shared `Badge`, `CardArt`, `Rating`, `Stars`, `Wordmark` and layout helpers.
- The directory keeps filter, sort, view and compare state in the URL so shortlists are shareable.

## Tracking

Affiliate clicks post to `/api/track` and are redirected through `/go/[slug]`. Country detection reads the geo header set by the hosting proxy; without one the directory shows global availability.
