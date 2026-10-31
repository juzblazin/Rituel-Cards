import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Coins,
  Globe2,
  Megaphone,
  PiggyBank,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { cards, kycLabel, type Card } from "@/lib/data";
import { parseFilters, type ViewMode } from "@/lib/filters";
import { cashbackLabel, feeLabel, pct } from "@/lib/format";
import { attributePages, cryptoBySlug, featuredPairs, supportedCountries } from "@/lib/taxonomy";
import { buildMetadata, faqJsonLd, itemListJsonLd, organizationJsonLd } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";
import { countryByCode } from "@/lib/countries";
import { Directory } from "@/components/directory/directory";
import { NetReturnCalculator } from "@/components/calculator";
import { AffiliateLink } from "@/components/affiliate-link";
import BlurText from "@/components/react-bits/blur-text";
import LogoLoop from "@/components/react-bits/logo-loop";
import ShinyText from "@/components/react-bits/shiny-text";
import SpotlightCard from "@/components/react-bits/spotlight-card";
import { Badge, CardArt, Rating } from "@/components/ui";
import { Badge as ShadBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { DotPattern } from "@/components/dot-pattern";

export const metadata: Metadata = buildMetadata({
  title: `Crypto Card Comparison 2026 — Compare ${cards.length} Debit, Credit & No-KYC Cards`,
  description:
    `Compare crypto cards on real fees, cashback, KYC and country availability. Independent data on ether.fi, Gnosis Pay, Crypto.com, Nexo, RedotPay and ${cards.length - 5} more.`,
  path: "/",
  keywords: [
    "crypto card comparison",
    "best crypto card",
    "crypto debit card",
    "no KYC crypto card",
    "self-custody crypto card",
    "crypto cashback card 2026",
  ],
});

const FAQS = [
  {
    q: "What is the best crypto card in 2026?",
    a: "For self-custody spenders in supported countries, ether.fi Cash is the strongest all-round package: 3% cashback in ETH, 0% FX and no annual fee. Gnosis Pay is better for European users who want an IBAN and 0% FX, while Nexo suits people who would rather borrow against crypto than sell it.",
  },
  {
    q: "Are there really no-KYC crypto cards?",
    a: "Yes, but only at low limits. RedotPay and Kast both offer a no-KYC tier capped at roughly $1,000 per month. Above that threshold you will need to complete identity verification. Treat no-KYC tiers as a convenience, not a way to avoid regulation.",
  },
  {
    q: "Do crypto cards charge FX fees?",
    a: "Many do. FX markups range from 0% (ether.fi, Gnosis Pay, Kraken) to 3% (BitPay, Fold). A 0% headline can still hide a weekend spread, so we track the fee notes separately for every card.",
  },
  {
    q: "Is a self-custody crypto card safer?",
    a: "Self-custody cards reduce counterparty risk because your assets stay in your own wallet until settlement. The trade-off is that you are responsible for key management, and most self-custody cards offer weaker rewards than custodial exchange cards.",
  },
  {
    q: "How does the net return calculator work?",
    a: "It subtracts the crypto top-up fee, FX markup and monthly share of the annual fee from the cashback earned at your spend level. It then ranks every card in the directory by net monthly value. Cashback is modelled at the maximum published tier and does not account for token price movement.",
  },
];

const NEEDS = [
  { slug: "no-kyc", label: "No KYC", icon: ShieldCheck, blurb: "Low-limit, minimal ID" },
  { slug: "self-custody", label: "Self-custody", icon: Wallet, blurb: "Keys stay with you" },
  { slug: "high-cashback", label: "High cashback", icon: PiggyBank, blurb: "3%+ headline rates" },
  { slug: "no-fx", label: "0% FX", icon: Globe2, blurb: "No travel markup" },
  { slug: "apple-pay", label: "Apple Pay", icon: BadgeCheck, blurb: "Tap to spend" },
  { slug: "virtual-ad-spend", label: "Ad spend", icon: Megaphone, blurb: "Virtual cards that work" },
];

const CARD_LOGOS: Record<string, string> = {
  "etherfi-cash": "/logos/etherfi-mark.jpeg",
  "gnosis-pay": "/logos/gnosispay.png",
  "crypto-com-visa": "/logos/cryptocom.png",
  "nexo-card": "/logos/nexo.png",
  "wirex-card": "/logos/wirex.png",
  redotpay: "/logos/redotpay.png",
  kast: "/logos/kast.png",
};

const STABLECOIN_ASSETS = [
  {
    slug: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    logo: "/crypto/tokens/usdc.png",
    blurb: "DeFi-native top-ups on Base, Arbitrum and Solana.",
  },
  {
    slug: "usdt",
    symbol: "USDT",
    name: "Tether",
    logo: "/crypto/tokens/usdt.png",
    blurb: "Widely accepted — cheapest on Tron and BNB Chain.",
  },
  {
    slug: "eure",
    symbol: "EURe",
    name: "Monerium EURe",
    logo: "/crypto/tokens/eure.jpg",
    blurb: "Euro-pegged settlement for zero-FX spend in Europe.",
  },
];

const ISSUERS = [
  { name: "ether.fi", logo: "/logos/etherfi-mark.jpeg" },
  { name: "Gnosis Pay", logo: "/logos/gnosispay.png" },
  { name: "Crypto.com", logo: "/logos/cryptocom.png" },
  { name: "Nexo", logo: "/logos/nexo.png" },
  { name: "RedotPay", logo: "/logos/redotpay.png" },
  { name: "Kraken", logo: "/logos/kraken.png" },
  { name: "Kast", logo: "/logos/kast.png" },
  { name: "BitPay", logo: "/logos/bitpay.png" },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const requestHeaders = await headers();
  const geoCountry = requestHeaders.get("x-geo-country") || "ALL";
  const filters = parseFilters(params);
  const view: ViewMode = params.view === "table" ? "table" : "grid";

  const sponsored = cards
    .filter((card) => card.isSponsored)
    .sort((a, b) => a.sponsorPriority - b.sponsorPriority)
    .slice(0, 3);

  const stablecoinGuide = attributePages.find((page) => page.slug === "stablecoin");
  const stablecoinCount = stablecoinGuide ? cards.filter(stablecoinGuide.filter).length : 0;
  const stablecoinAssets = STABLECOIN_ASSETS.map((asset) => {
    const page = cryptoBySlug.get(asset.slug);
    return { ...asset, count: page ? cards.filter(page.filter).length : 0 };
  });

  const countryCounts = new Map<string, number>();
  for (const card of cards) {
    for (const code of card.supportedCountries) {
      countryCounts.set(code, (countryCounts.get(code) ?? 0) + 1);
    }
  }
  const topCountries = [...countryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([code, count]) => ({ country: countryByCode.get(code), count }))
    .filter((entry) => entry.country !== undefined)
    .map((entry) => ({ country: entry.country!, count: entry.count }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: site.name,
            url: site.url,
            description: site.description,
            potentialAction: {
              "@type": "SearchAction",
              target: `${absoluteUrl("/")}?q={search_term_string}#directory`,
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd("Crypto cards", cards)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }} />

      <section className="relative overflow-hidden border-b bg-gradient-to-b from-background to-background/60 pb-16 pt-16 sm:pt-20">
        <div className="hero-aurora" aria-hidden="true" />
        <DotPattern className="opacity-50" fadeStyle="ellipse" />
        <div className="container-page relative">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 flex justify-center">
              <ShadBadge
                variant="brand"
                className="h-auto gap-2 px-3 py-1.5 text-xs shadow-[0_0_28px_-14px_var(--brand)]"
              >
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
                </span>
                <span className="dark:hidden">
                  <ShinyText
                    text={`Updated October 2026 · ${cards.length} cards · 12 fee inputs`}
                    color="#52525b"
                    shineColor="#18181b"
                    speed={4}
                    shineWidth={30}
                    trigger="view"
                  />
                </span>
                <span className="hidden dark:inline-block">
                  <ShinyText
                    text={`Updated October 2026 · ${cards.length} cards · 12 fee inputs`}
                    color="#a1a1aa"
                    shineColor="#fafafa"
                    speed={4}
                    shineWidth={30}
                    trigger="view"
                  />
                </span>
                <ArrowRight />
              </ShadBadge>
            </div>

            <h1 className="text-balance text-[2.125rem]/[1.1] font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Find the crypto card
              <br />
              that actually pays you.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
              Real cashback, real FX fees, real country availability. We normalise the fine print across
              debit, credit and prepaid cards so you can pick in minutes — not days.
            </p>

            <form action="/#directory" method="get" className="mx-auto mt-8 max-w-xl">
              <div className="flex items-center gap-1 rounded-xl border border-brand/20 bg-card/80 p-1.5 shadow-[0_24px_70px_-38px_var(--brand)] ring-1 ring-brand/10 backdrop-blur-xl">
                <Search className="ml-2 size-4 shrink-0 text-muted-foreground" aria-hidden />
                <Input
                  type="search"
                  name="q"
                  placeholder="Search cards, issuers or tokens…"
                  className="h-9 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                  aria-label="Search crypto cards"
                />
                <Button type="submit" variant="brand" className="h-9 shrink-0">
                  Search cards <ArrowRight />
                </Button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
              <span className="text-xs text-muted-foreground">Popular:</span>
              {[
                ["No KYC", "/crypto-card/no-kyc"],
                ["Self-custody", "/crypto-card/self-custody"],
                ["0% FX", "/crypto-card/no-fx"],
                ["Apple Pay", "/crypto-card/apple-pay"],
                ["USDT", "/crypto/usdt"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-full border bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-brand/40 hover:bg-brand/10 hover:text-brand"
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink
                href="/#directory"
                size="lg"
                className="h-9 px-4 shadow-[0_14px_44px_-22px_var(--brand)]"
              >
                Browse all {cards.length} cards <ArrowRight />
              </ButtonLink>
              <ButtonLink
                href="/methodology"
                variant="outline"
                size="lg"
                className="h-9 border-brand/20 bg-background/60 px-4 hover:border-brand/40 hover:bg-brand/10"
              >
                How we score
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b bg-muted/30 py-8">
        <div className="glow-line pointer-events-none absolute inset-x-0 top-0 h-px opacity-70" aria-hidden="true" />
        <div className="container-page">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Fee data tracked across the cards people actually use
          </p>
          <div className="mt-5">
            <LogoLoop
              logos={ISSUERS.map((issuer) => ({
                src: issuer.logo,
                alt: issuer.name,
                width: 48,
                height: 48,
              }))}
              logoHeight={48}
              gap={44}
              speed={80}
              pauseOnHover
              fadeOut
              scaleOnHover
              ariaLabel="Issuers tracked"
            />
          </div>
        </div>
      </section>

      <FeaturedPartners cards={sponsored} />

      <section id="directory" className="scroll-mt-20 border-y bg-muted/30 py-16">
        <div className="container-page">
          <SectionHeader
            eyebrow="Crypto Card List"
            title="Every card, side by side"
            description="Toggle grid or table view. Filters, sort and country state stay in the URL, so every shortlist is shareable."
          />
        </div>
        <div className="mt-8">
          <Directory
            allCards={cards}
            initialFilters={filters}
            geoCountry={geoCountry}
            initialView={view}
            syncUrl
            heading="All crypto cards"
            subheading="Filter by fees, KYC, country and features — then compare up to four cards."
            source="directory-grid"
          />
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          <NetReturnCalculator cards={cards} />
        </div>
      </section>

      <section className="border-y bg-muted/30 py-16 sm:py-24">
        <div className="container-page">
          <SectionHeader
            eyebrow="Browse by need"
            title="Start with the constraint that matters"
            description="Programmatic hubs built from the same fee database — not hand-written listicles."
            href="/crypto-card"
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {NEEDS.map((need) => {
              const page = attributePages.find((item) => item.slug === need.slug);
              const count = page ? cards.filter(page.filter).length : 0;
              const Icon = need.icon;
              return (
                <Link
                  key={need.slug}
                  href={`/crypto-card/${need.slug}`}
                  className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-brand/35 hover:bg-brand/[0.04]"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand ring-1 ring-brand/15 transition-colors group-hover:bg-brand/15">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{need.label}</span>
                    <span className="block text-xs text-muted-foreground">{need.blurb}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-sm font-semibold">{count}</span>
                    <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">cards</span>
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          <SectionHeader
            eyebrow="Geo directory"
            title="Crypto cards by country"
            description="Country pages are generated from each issuer's published availability list."
            href="/countries"
          />
          <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {topCountries.map(({ country, count }) => (
              <Link
                key={country.code}
                href={`/countries/${country.slug}`}
                className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm transition-colors hover:bg-accent"
              >
                <span className="text-base" aria-hidden>{country.flag}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{country.name}</span>
                <span className="num rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/30 py-16">
        <div className="container-page">
          <SectionHeader
            eyebrow="Head-to-head"
            title="Popular card comparisons"
            description="Fee-level comparisons with a winner marked for every metric."
            href="/compare"
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPairs.slice(0, 6).map((pair) => (
              <Link
                key={pair.slug}
                href={`/compare/${pair.slug}`}
                className="group flex items-center gap-2.5 rounded-xl border bg-card px-2.5 py-2 transition-colors hover:bg-accent"
              >
                <div className="flex shrink-0 items-center gap-1.5">
                  {[pair.a, pair.b].map((card) => {
                    const logo = CARD_LOGOS[card.slug];
                    return logo ? (
                      <Image
                        key={card.slug}
                        src={logo}
                        alt={`${card.name} logo`}
                        width={32}
                        height={32}
                        className="size-8 rounded-lg object-cover ring-1 ring-black/10"
                      />
                    ) : (
                      <span
                        key={card.slug}
                        aria-label={card.name}
                        className="grid size-8 place-items-center rounded-lg text-[11px] font-bold ring-1 ring-black/10"
                        style={{ background: card.brand.from, color: card.brand.ink }}
                      >
                        {card.logoText}
                      </span>
                    );
                  })}
                </div>
                <div className="line-clamp-2 min-w-0 flex-1 text-xs font-medium leading-tight">
                  {pair.a.name}
                  <span className="px-1.5 text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                    vs
                  </span>
                  {pair.b.name}
                </div>
                <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          <SectionHeader
            eyebrow="Stablecoin"
            title="Cards that run on stablecoins"
            description="Top up from USDC, USDT or EURe and keep your balance pegged to fiat. Compare top-up costs, cashback and FX across every stablecoin-ready programme."
            href="/crypto-card/stablecoin"
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stablecoinAssets.map((asset) => (
              <Link
                key={asset.slug}
                href={`/crypto/${asset.slug}`}
                className="group flex flex-col rounded-xl border bg-card p-4 transition-colors hover:border-brand/35 hover:bg-brand/[0.04]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-black/5 dark:ring-white/15" aria-hidden>
                    <Image src={asset.logo} alt="" width={24} height={24} className="size-6 object-contain" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{asset.symbol}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{asset.name}</span>
                  </span>
                  <span className="num text-xs font-semibold text-muted-foreground">{asset.count}</span>
                </div>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">{asset.blurb}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground">
                  Compare cards
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
            <Link
              href="/crypto-card/stablecoin"
              className="group flex flex-col rounded-xl border border-brand/25 bg-brand/[0.04] p-4 transition-colors hover:border-brand/45 hover:bg-brand/[0.08]"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/15 text-brand ring-1 ring-brand/20" aria-hidden>
                  <Coins className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">All stablecoin cards</span>
                  <span className="block text-[11px] text-muted-foreground">USDC · USDT · EURe</span>
                </span>
                <span className="num text-xs font-semibold text-muted-foreground">{stablecoinCount}</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                The full guide to cards that accept stablecoins, ranked on fees and cashback.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand">
                Open guide
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
                <ShadBadge variant="outline" className="mb-4">FAQ</ShadBadge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Questions worth asking first</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Short answers, sourced from the same dataset as the directory.
                </p>
              </div>
              <div className="mt-8 divide-y rounded-xl border bg-card">
                {FAQS.map((faq) => (
                  <details key={faq.q} className="group px-5 py-4">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-medium">
                      {faq.q}
                      <span className="grid size-6 shrink-0 place-items-center rounded-full border text-muted-foreground transition group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 pr-8 text-sm leading-6 text-muted-foreground">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-brand/10 text-brand ring-1 ring-brand/15">
                  <Globe2 className="size-4" />
                </span>
                <h2 className="text-sm font-semibold">Country coverage, tracked</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                We map {supportedCountries.length} country pages against {cards.length} card programmes. If an issuer does not
                publish a country list, we mark it as regional rather than guessing.
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {supportedCountries.slice(0, 18).map((country) => (
                  <Link
                    key={country.code}
                    href={`/countries/${country.slug}`}
                    className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-brand/30 hover:bg-brand/10 hover:text-brand"
                  >
                    {country.flag} {country.name}
                  </Link>
                ))}
              </div>
              <ButtonLink href="/countries" variant="outline" size="sm" className="mt-5">
                All countries <ArrowRight />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t bg-muted/40 py-16 sm:py-24">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/15 blur-[130px]"
          aria-hidden="true"
        />
        <div className="container-page relative">
          <div className="mx-auto max-w-3xl text-center">
            <ShadBadge variant="brand" className="mb-4">Free, independent, updated monthly</ShadBadge>
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
              Stop guessing which card keeps more of your money.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              Compare the real net return at your spend level, filter by the country you actually live in, and
              open the card that fits.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/#directory" variant="brand" size="lg" className="h-10 px-6">
                Compare cards <ArrowRight />
              </ButtonLink>
              <ButtonLink
                href="/submit-card"
                variant="outline"
                size="lg"
                className="h-10 border-brand/20 bg-background/60 px-6 hover:border-brand/40 hover:bg-brand/10"
              >
                List your card
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div className="max-w-2xl">
        <ShadBadge variant="brand" className="mb-3">{eyebrow}</ShadBadge>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        {description && <p className="mt-3 text-muted-foreground">{description}</p>}
      </div>
      {href && (
        <ButtonLink href={href} variant="outline" size="sm" className="shrink-0">
          View all <ArrowRight />
        </ButtonLink>
      )}
    </div>
  );
}

function FeaturedPartners({ cards: sponsored }: { cards: Card[] }) {
  return (
    <section className="relative overflow-hidden py-16" aria-labelledby="featured-partners">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[24rem] w-[48rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]"
        aria-hidden="true"
      />
      <div className="container-page relative">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <ShadBadge variant="brand" className="mb-3">Featured partners</ShadBadge>
            <h2 id="featured-partners" className="text-2xl font-bold tracking-tight sm:text-3xl">
              Cards worth a closer look
            </h2>
            <p className="mt-3 text-muted-foreground">
              Paid placement, independently scored. Sponsorship never changes a rating or a fee input.
            </p>
          </div>
          <ButtonLink
            href="/methodology"
            variant="ghost"
            size="default"
            className="text-muted-foreground hover:bg-brand/10 hover:text-brand"
          >
            How placement works <ArrowUpRight />
          </ButtonLink>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sponsored.map((card) => (
            <Link key={card.slug} href={`/crypto-card/${card.slug}`}>
              <SpotlightCard
                theme="auto"
                spotlightColor="oklch(0.66 0.23 292)"
                intensity={0.08}
                spotlightSize={280}
                softness={0.8}
                borderGlow={0.45}
                className="group flex flex-col rounded-xl border border-border/80 p-5 transition-colors hover:border-brand/40"
              >
                <CardArt card={card} size="lg" className="aspect-[1.58/1] w-full" />

                <div className="mt-5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="flex items-center gap-1.5 text-lg font-semibold tracking-tight">
                      <span className="truncate">{card.name}</span>
                      <BadgeCheck className="size-4 shrink-0 text-success" />
                    </h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{card.issuerName}</p>
                  </div>
                  <Rating score={card.ratingScore} className="text-sm" />
                </div>

                <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">{card.tagline}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ShadBadge variant="success" className="h-6 px-2.5 text-xs">{cashbackLabel(card)}</ShadBadge>
                  <span className="text-xs text-muted-foreground">FX {pct(card.fxFeePct)}</span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 border-t pt-4">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Annual</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{feeLabel(card.annualFeeUsd, "None")}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">KYC</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{kycLabel[card.kycLevel]}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Score</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{card.ratingScore.toFixed(1)} / 10</p>
                  </div>
                </div>

                <div className="mt-auto flex gap-2.5 pt-5">
                  <Button variant="outline" size="default" className="h-9 flex-1">
                    Details
                  </Button>
                  <div className="flex-1">
                    <AffiliateLink
                      slug={card.slug}
                      cardName={card.name}
                      source="featured-partner"
                      preventNested
                      className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-3 text-sm font-medium text-brand-foreground shadow-[0_10px_30px_-14px_var(--brand)] transition hover:bg-brand/90"
                    >
                      Get card <ArrowUpRight className="size-4" />
                    </AffiliateLink>
                  </div>
                </div>
              </SpotlightCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
