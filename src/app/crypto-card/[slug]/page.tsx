import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronRight,
  Globe2,
  Star,
  X,
} from "lucide-react";
import { brandName, cardBySlug, cards, custodyLabel, kycLabel, networkLabel, relatedFamilyCards, type Card } from "@/lib/data";
import { issuerForCard } from "@/lib/issuers";
import { cashbackLabel, feeLabel, isNew, money, pct, relativeAge, sentences, shortCardName } from "@/lib/format";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd, financialProductJsonLd, routeOgImage } from "@/lib/seo";
import { countryByCode } from "@/lib/countries";
import { compareSlug, featuredPairs, attributeBySlug, attributePages } from "@/lib/taxonomy";
import { AttributeView, attributeMetadata } from "./attribute-view";
import { cn } from "@/lib/cn";
import { AffiliateLink } from "@/components/affiliate-link";
import { CardEarnings } from "@/components/card-earnings";
import { Badge, CardArt, Rating, Stars } from "@/components/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (attributeBySlug.has(slug)) return attributeMetadata(slug);
  const card = cardBySlug.get(slug);
  if (!card) return {};
  return buildMetadata({
    title: `${shortCardName(card.name)} Review (2026): Fees & Cashback`,
    description: cardDescription(card),
    path: `/crypto-card/${card.slug}`,
    image: routeOgImage(`/crypto-card/${card.slug}`, `${card.name}: fees, cashback and availability`),
    keywords: [card.name, `${card.name} review`, `${card.name} fees`, `${card.name} cashback`],
  });
}

const MAX_DESCRIPTION_LENGTH = 160;

function cardDescription(card: Card): string {
  const name = shortCardName(card.name);
  const fees = `${name} charges ${pct(card.fxFeePct)} FX and ${card.annualFeeUsd === 0 ? "has no annual fee" : `costs ${money(card.annualFeeUsd)} per year`}`;
  const options = [
    sentences(card.tagline, fees, "Compare fees, limits and availability"),
    sentences(card.tagline, fees),
    sentences(fees, cashbackLabel(card), "Compare fees, limits and country availability"),
    sentences(fees, "Compare fees, limits and country availability"),
  ];
  return options.find((option) => option.length <= MAX_DESCRIPTION_LENGTH) ?? options[options.length - 1];
}

export function generateStaticParams() {
  return [
    ...cards.map((card) => ({ slug: card.slug })),
    ...attributePages.map((page) => ({ slug: page.slug })),
  ];
}

export default async function CardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (attributeBySlug.has(slug)) return <AttributeView slug={slug} />;
  const card = cardBySlug.get(slug);
  if (!card) notFound();

  const requestHeaders = await headers();
  const geoCountry = requestHeaders.get("x-geo-country") || "ALL";
  const geo = geoCountry !== "ALL" ? countryByCode.get(geoCountry) : undefined;
  const availableInGeo = geo ? card.supportedCountries.includes(geo.code) : null;

  const faqs = buildCardFaqs(card, geo?.name, availableInGeo);
  const family = relatedFamilyCards(card);
  const issuer = issuerForCard(card);
  const related = cards
    .filter((item) => item.slug !== card.slug && !family.some((f) => f.slug === item.slug))
    .sort((a, b) => {
      const score = (candidate: Card) =>
        (candidate.custodyModel === card.custodyModel ? 2 : 0) +
        (candidate.kycLevel === card.kycLevel ? 1 : 0) +
        candidate.supportedCryptos.filter((token) => card.supportedCryptos.includes(token)).length / 10;
      return score(b) - score(a) || b.ratingScore - a.ratingScore;
    })
    .slice(0, 3);

  const pairs = featuredPairs.filter((pair) => pair.a.slug === card.slug || pair.b.slug === card.slug).slice(0, 3);
  const compareTargets =
    pairs.length > 0
      ? pairs
      : cards
          .filter((item) => item.slug !== card.slug)
          .slice(0, 3)
          .map((item) => ({ a: card, b: item, slug: compareSlug(card.slug, item.slug) }));

  const countryLinks = card.supportedCountries
    .map((code) => countryByCode.get(code))
    .filter((country): country is NonNullable<typeof country> => Boolean(country))
    .sort((a, b) => a.name.localeCompare(b.name));

  const visibleCountries = countryLinks.slice(0, 18);
  const restCountries = countryLinks.slice(18);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(financialProductJsonLd(card)) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Crypto cards", path: "/" },
              { name: card.name, path: `/crypto-card/${card.slug}` },
            ]),
          ),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />

      <div className="border-b border-border bg-background/60">
        <div className="container-page flex items-center gap-1.5 overflow-x-auto py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Crypto Card</Link>
          <ChevronRight className="size-3 shrink-0" />
          <Link href="/crypto-card" className="hover:text-foreground">Cards</Link>
          <ChevronRight className="size-3 shrink-0" />
          <span className="truncate font-medium text-muted-foreground">{card.name}</span>
        </div>
      </div>

      <div className="container-page pt-5">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid lg:grid-cols-[340px_minmax(0,1fr)]">
            <div
              className="relative flex items-center justify-center p-6 sm:p-8"
              style={{
                background: `linear-gradient(145deg, ${card.brand.from}0f, ${card.brand.to}22)`,
              }}
            >
              <div className="w-full max-w-[270px]">
                <CardArt card={card} size="lg" className="aspect-[1.58/1] w-full" />
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono uppercase tracking-wider">{networkLabel[card.network]}</span>
                    <span>Issued by {card.issuerName}</span>
                  </div>
                  {issuer && (
                    <Link
                      href={`/issuer/${issuer.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      {issuer.cards.length > 1
                        ? `Compare all ${issuer.name} cards (${issuer.cards.length})`
                        : `View the ${issuer.name} issuer page`}
                      <ChevronRight className="size-3 shrink-0" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-1.5">
                {card.isSponsored && <Badge>Sponsored</Badge>}
                <Badge tone={card.kycLevel === "no_kyc" ? "emerald" : "neutral"}>{kycLabel[card.kycLevel]}</Badge>
                {card.custodyModel === "self_custody" && <Badge tone="dark">Self-custody</Badge>}
                <Badge>{networkLabel[card.network]}</Badge>
                <Badge>{card.cardType === "credit" ? "Credit" : card.cardType === "prepaid" ? "Prepaid" : "Debit"}</Badge>
                {isNew(card.launchedAt) && <Badge tone="amber">{relativeAge(card.launchedAt)}</Badge>}
              </div>

              <div className="mt-2 flex items-start justify-between gap-3">
                <div>
                  <h1 className="flex items-center gap-1.5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                    {card.name}
                    {card.isVerified && (
                      <BadgeCheck className="size-5 shrink-0 text-success" aria-label="Verified listing" />
                    )}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {card.issuerName} · {card.regionLabel} · {card.audience === "both" ? "Personal & business" : card.audience}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-2xl font-semibold tracking-[-0.04em] text-foreground">{card.ratingScore.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">/10</span>
                  </div>
                  <Stars score={card.ratingScore} className="justify-end" />
                  <div className="mt-0.5 text-[10px] text-muted-foreground">{card.reviewCount.toLocaleString("en-US")} reviews</div>
                </div>
              </div>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{card.tagline}</p>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <HeroMetric label="Cashback" value={pct(card.cashbackMaxPct)} accent />
                <HeroMetric label="FX fee" value={pct(card.fxFeePct)} accent={card.fxFeePct === 0} />
                <HeroMetric label="Annual fee" value={feeLabel(card.annualFeeUsd, "None")} />
                <HeroMetric
                  label={geo ? `In ${geo.name}` : "Availability"}
                  value={geo ? (availableInGeo ? "Available" : "Not available") : `${card.supportedCountries.length} countries`}
                  accent={geo ? availableInGeo === true : undefined}
                  warn={geo ? availableInGeo === false : undefined}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <AffiliateLink
                  slug={card.slug}
                  cardName={card.name}
                  source="card-hero"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/80"
                >
                  Get {card.name} <ArrowUpRight className="size-4" />
                </AffiliateLink>
                <Link
                  href={`/compare/${compareTargets[0].slug}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-4 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  Compare <ArrowRight className="size-3.5" />
                </Link>
                <span className="text-[10px] text-muted-foreground">
                  Affiliate link · issuer may pay us a commission
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {card.hasVirtual && <Badge>Virtual</Badge>}
                {card.hasPhysical && <Badge>Physical</Badge>}
                {card.supportedCryptos.slice(0, 6).map((token) => (
                  <span key={token} className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {token}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page mt-6 grid gap-6 pb-8 lg:grid-cols-[minmax(0,1fr)_312px]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <SectionTitle eyebrow="The verdict" title={`Is ${card.name} worth it?`} />
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.description}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border bg-card p-3.5">
                <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Pros</h3>
                <ul className="mt-2 space-y-1.5">
                  {card.pros.map((pro) => (
                    <li key={pro} className="flex gap-1.5 text-sm leading-5 text-muted-foreground">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success" /> {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border bg-card p-3.5">
                <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Cons</h3>
                <ul className="mt-2 space-y-1.5">
                  {card.cons.map((con) => (
                    <li key={con} className="flex gap-1.5 text-sm leading-5 text-muted-foreground">
                      <X className="mt-0.5 size-3.5 shrink-0 text-destructive" /> {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
              <SectionTitle eyebrow="Full transparency" title="Fees, limits & requirements" />
              <span className="text-[10px] text-muted-foreground">Reviewed Oct 2026</span>
            </div>
            <dl className="divide-y divide-border">
              <FeeRow label="Issuance fee" value={feeLabel(card.issuanceFeeUsd)} note="One-time card creation" />
              <FeeRow label="Annual fee" value={feeLabel(card.annualFeeUsd, "None")} note="Monthly fees included where applicable" />
              <FeeRow label="Crypto top-up" value={pct(card.topupFeePct)} note={card.topupFeeNotes} />
              <FeeRow label="FX fee" value={pct(card.fxFeePct)} note={card.fxFeeNotes} accent={card.fxFeePct === 0} />
              <FeeRow label="ATM fee" value={pct(card.atmFeePct)} note={card.atmFeeNote} accent={card.atmFeePct === 0} />
              <FeeRow label="Max daily spend" value={money(card.maxDailySpendUsd)} note="Subject to KYC tier and issuer limits" />
              <FeeRow
                label="Monthly ATM limit"
                value={card.monthlyAtmLimitUsd === 0 ? "No ATM access" : money(card.monthlyAtmLimitUsd)}
                note={card.atmFeeNote}
              />
              <FeeRow label="KYC" value={kycLabel[card.kycLevel]} note={card.requirementsText} />
              <FeeRow label="Custody" value={custodyLabel[card.custodyModel]} note={card.custodyModel === "self_custody" ? "Funds remain in your wallet until settlement" : "Issuer holds funds on your behalf"} />
              <FeeRow label="Card network" value={networkLabel[card.network]} note={`${card.cardType} card · issued by ${card.issuerName}`} />
            </dl>
          </section>

          {card.tiers.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <SectionTitle eyebrow="Tier breakdown" title={`${card.name} tiers`} />
              <p className="mt-1 text-xs text-muted-foreground">
                Every tier is included in the comparison engine. Staking requirements are not priced in.
              </p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {card.tiers.map((tier, index) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-xl border p-3.5",
                      index === card.tiers.length - 1 ? "border-success/25 bg-muted/40" : "border-border",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{tier.name}</h3>
                        <p className="text-xs text-muted-foreground">Stake: {tier.stake}</p>
                      </div>
                      <span className="rounded-md bg-success/10 px-1.5 py-0.5 text-xs font-medium text-success">
                        {pct(tier.cashbackPct)} back
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
                      <div className="rounded bg-card px-2 py-1">
                        <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Annual</span>
                        <span className="num font-semibold">{feeLabel(tier.annualFeeUsd, "None")}</span>
                      </div>
                      <div className="rounded bg-card px-2 py-1">
                        <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">FX</span>
                        <span className="num font-semibold">{pct(tier.fxFeePct)}</span>
                      </div>
                    </div>
                    <ul className="mt-2 space-y-0.5">
                      {tier.perks.map((perk) => (
                        <li key={perk} className="text-xs leading-4 text-muted-foreground">· {perk}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {family.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <SectionTitle eyebrow="Same product" title="Related crypto cards" />
              <p className="mt-1 text-xs text-muted-foreground">
                Other {brandName(card)} cards, each priced on its own. Fees, cashback and perks differ per card.
              </p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {family.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/crypto-card/${item.slug}`}
                    className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-brand/50 hover:bg-muted/50"
                  >
                    <CardArt card={item} className="h-11 w-16 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">{item.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {pct(item.cashbackMaxPct)} back · {pct(item.fxFeePct)} FX · {feeLabel(item.annualFeeUsd, "No annual fee")}
                      </span>
                      <span className="mt-1 flex items-center gap-2">
                        <Rating score={item.ratingScore} className="text-xs" />
                        <Badge tone="neutral">{item.cardType}</Badge>
                        {item.hasMetal ? <Badge tone="neutral">metal</Badge> : null}
                      </span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <SectionTitle eyebrow="Funding" title="Supported crypto & networks" />
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tokens</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {card.supportedCryptos.map((token) => (
                    <span key={token} className="rounded-lg border border-border bg-muted px-2 py-1 font-mono text-xs font-medium text-foreground">
                      {token}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chains</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {card.supportedChains.map((chain) => (
                    <Link
                      key={chain}
                      href={`/crypto/${chain.toLowerCase().replace(/\s+/g, "-")}`}
                      className="rounded-lg border border-border bg-card px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                    >
                      {chain}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">Payout token:</span>
              <span className="rounded bg-primary px-1.5 py-0.5 font-mono text-xs text-primary-foreground">{card.payoutToken}</span>
              <span className="text-xs text-muted-foreground">Staking: {card.stakingRequirement}</span>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-2">
              <SectionTitle eyebrow="Eligibility" title={`Where is ${card.name} available?`} />
              <Badge tone="neutral">
                <Globe2 className="size-3" /> {card.regionLabel}
              </Badge>
            </div>
            {geo && (
              <div
                className={cn(
                  "mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                  availableInGeo
                    ? "border-success/25 bg-success/10 text-success"
                    : "border-destructive/25 bg-destructive/5 text-destructive",
                )}
              >
                <span aria-hidden>{geo.flag}</span>
                {availableInGeo
                  ? `Available in ${geo.name} according to the issuer's published list.`
                  : `${geo.name} is not on the issuer's published availability list.`}
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {visibleCountries.map((country) => (
                <Link
                  key={country.code}
                  href={`/countries/${country.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                >
                  <span aria-hidden>{country.flag}</span> {country.name}
                </Link>
              ))}
            </div>
            {restCountries.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-medium text-foreground underline-offset-4 hover:underline">
                  Show all {countryLinks.length} supported countries
                </summary>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {restCountries.map((country) => (
                    <Link
                      key={country.code}
                      href={`/countries/${country.slug}`}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                    >
                      <span aria-hidden>{country.flag}</span> {country.name}
                    </Link>
                  ))}
                </div>
              </details>
            )}
            <p className="mt-3 text-[10px] leading-4 text-muted-foreground">
              Availability lists change frequently. Confirm eligibility with {card.issuerName} before applying.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <SectionTitle eyebrow="FAQ" title={`${card.name} — common questions`} />
            <div className="mt-3 divide-y divide-border">
              {faqs.map((faq) => (
                <details key={faq.q} className="group py-3">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-foreground">
                    {faq.q}
                    <span className="grid size-5 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-1.5 pr-6 text-xs leading-5 text-muted-foreground">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[76px] lg:self-start">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {card.isSponsored ? "Featured partner" : "Editor score"}
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight">{card.ratingScore.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">/ 10</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-success">
                <Star className="size-3 fill-current" /> {cashbackLabel(card)}
              </div>
            </div>

            <dl className="mt-3 space-y-2 text-xs">
              <SidebarRow label="FX fee" value={pct(card.fxFeePct)} highlight={card.fxFeePct === 0} />
              <SidebarRow label="Annual fee" value={feeLabel(card.annualFeeUsd, "None")} />
              <SidebarRow label="Top-up" value={pct(card.topupFeePct)} />
              <SidebarRow label="KYC" value={kycLabel[card.kycLevel]} />
              <SidebarRow label="Custody" value={custodyLabel[card.custodyModel]} />
            </dl>

            <AffiliateLink
              slug={card.slug}
              cardName={card.name}
              source="card-sidebar"
              className="mt-3 flex h-9 w-full items-center justify-center gap-1 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition hover:bg-primary/80"
            >
              Get {card.name} <ArrowUpRight className="size-3.5" />
            </AffiliateLink>
            <p className="mt-1.5 text-center text-[10px] leading-3 text-muted-foreground">
              We may earn a commission. Fees verified Oct 2026.
            </p>
          </div>

          <CardEarnings card={card} />

          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Compare with</h2>
            <div className="mt-2 space-y-1">
              {compareTargets.map((pair) => {
                const other = pair.a.slug === card.slug ? pair.b : pair.a;
                return (
                  <Link
                    key={pair.slug}
                    href={`/compare/${pair.slug}`}
                    className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-muted"
                  >
                    <CardArt card={other} className="h-7 w-10 shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">{other.name}</span>
                    <ArrowRight className="size-3 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Similar cards</h2>
            <div className="mt-2 space-y-1">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/crypto-card/${item.slug}`}
                  className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-muted"
                >
                  <CardArt card={item} className="h-7 w-10 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-foreground">{item.name}</span>
                    <span className="block text-[10px] text-muted-foreground">{pct(item.cashbackMaxPct)} back · {pct(item.fxFeePct)} FX</span>
                  </span>
                  <Rating score={item.ratingScore} className="text-xs" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Related guides</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                card.kycLevel === "no_kyc" || card.kycLevel === "light_kyc" ? ["No-KYC cards", "/crypto-card/no-kyc"] : null,
                card.custodyModel === "self_custody" ? ["Self-custody", "/crypto-card/self-custody"] : null,
                card.cashbackMaxPct >= 3 ? ["High cashback", "/crypto-card/high-cashback"] : null,
                card.fxFeePct === 0 ? ["0% FX cards", "/crypto-card/no-fx"] : null,
                card.mobileWallets.includes("apple_pay") ? ["Apple Pay", "/crypto-card/apple-pay"] : null,
                card.audience !== "personal" ? ["Business cards", "/crypto-card/business"] : null,
              ]
                .filter((item): item is string[] => Boolean(item))
                .map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-full border border-border bg-muted px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                  >
                    {label}
                  </Link>
                ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="border-t border-border bg-muted/40 py-6">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <p className="max-w-2xl">
            <strong className="font-semibold text-muted-foreground">Data note:</strong> fees, limits and availability are
            illustrative seed data for this build. Always confirm with the issuer. Card trademarks belong to their
            respective owners.
          </p>
          <div className="flex gap-3">
            <Link href="/methodology" className="hover:text-foreground">Methodology</Link>
            <Link href="/submit-card" className="hover:text-foreground">Report an error</Link>
          </div>
        </div>
      </div>
    </>
  );
}

function buildCardFaqs(card: Card, detectedCountry?: string, available?: boolean | null) {
  const walletNames = card.mobileWallets
    .map((wallet) => (wallet === "apple_pay" ? "Apple Pay" : wallet === "google_pay" ? "Google Pay" : "Samsung Pay"))
    .join(" and ");
  const issuanceText = card.issuanceFeeUsd === 0 ? "no issuance fee" : `a ${money(card.issuanceFeeUsd, 2)} issuance fee`;
  const annualText = card.annualFeeUsd === 0 ? "no annual fee" : `a ${money(card.annualFeeUsd)} annual fee`;

  return [
    {
      q: `Is ${card.name} available in ${detectedCountry ?? "my country"}?`,
      a:
        detectedCountry && available === false
          ? `${detectedCountry} is not on ${card.name}'s published availability list. The card is currently offered in ${card.regionLabel}; availability can change, so confirm with ${card.issuerName} before applying.`
          : `${card.name} is listed as available in ${card.regionLabel}. ${detectedCountry ? `Our data currently shows it as available in ${detectedCountry}.` : ""} Always confirm eligibility with ${card.issuerName} before applying.`,
    },
    {
      q: `What fees does ${card.name} charge?`,
      a: `${card.name} has ${issuanceText}, ${annualText}, a ${pct(card.topupFeePct)} crypto top-up fee and a ${pct(card.fxFeePct)} FX fee. ATM withdrawals cost ${pct(card.atmFeePct)}. ${card.fxFeeNotes}`,
    },
    {
      q: `Does ${card.name} support Apple Pay and Google Pay?`,
      a: walletNames
        ? `${card.name} supports ${walletNames}. You can add the virtual card to your mobile wallet after issuance.`
        : `${card.name} does not currently list mobile wallet support. You will need to use the physical card or card details directly.`,
    },
    {
      q: `Is ${card.name} self-custody?`,
      a:
        card.custodyModel === "self_custody"
          ? `Yes. ${card.name} is non-custodial: your assets stay in your own wallet until the moment of settlement. You remain responsible for key management and wallet security.`
          : `${card.name} uses a ${custodyLabel[card.custodyModel].toLowerCase()} model. ${card.issuerName} holds the funds used for spending, which introduces counterparty risk but simplifies onboarding and recovery.`,
    },
    {
      q: `How does ${card.name} cashback work?`,
      a: `${card.name} offers ${cashbackLabel(card)}. Rewards are paid in ${card.payoutToken}. Staking requirement: ${card.stakingRequirement}. Cashback is modelled at the maximum published tier in our calculator.`,
    },
  ];
}

function HeroMetric({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/60 px-2.5 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</div>
      <div
        className={cn(
          "num mt-0.5 truncate text-[14px] font-semibold tracking-tight",
          accent ? "text-success" : warn ? "text-destructive" : "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function FeeRow({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  accent?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-1 px-5 py-2.5 sm:grid-cols-[180px_120px_1fr]">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className={cn("num text-right text-xs font-semibold sm:text-left", accent ? "text-success" : "text-foreground")}>
        {value}
      </dd>
      <dd className="col-span-2 text-xs leading-4 text-muted-foreground sm:col-span-1">{note}</dd>
    </div>
  );
}

function SidebarRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-1.5 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("num font-semibold", highlight ? "text-success" : "text-foreground")}>{value}</dd>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{eyebrow}</div>
      <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
    </div>
  );
}
