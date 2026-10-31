import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Landmark } from "lucide-react";
import { issuerBySlug, issuers } from "@/lib/issuers";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd, itemListJsonLd, routeOgImage } from "@/lib/seo";
import { cashbackLabel, feeLabel, plural } from "@/lib/format";
import { custodyLabel, kycLabel } from "@/lib/data";
import { ComparisonMatrix, WinnerSummary } from "@/components/compare/comparison-matrix";
import { Badge } from "@/components/ui";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return issuers.map((issuer) => ({ slug: issuer.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const issuer = issuerBySlug.get(slug);
  if (!issuer) return {};
  const multi = issuer.cards.length > 1;
  const title = multi
    ? `Compare ${issuer.name} crypto cards (${issuer.cards.length} cards, 2026)`
    : `${issuer.topCard.name} — fees, cashback and availability`;
  const description = multi
    ? `All ${issuer.cards.length} ${issuer.name} crypto cards side by side: fees, cashback, limits, KYC and supported assets. Updated for October 2026.`
    : `${issuer.topCard.name} reviewed: ${cashbackLabel(issuer.topCard)}, ${feeLabel(issuer.topCard.annualFeeUsd)} annual fee, ${issuer.topCard.supportedCountries.length} countries.`;
  return buildMetadata({
    title,
    description,
    path: `/issuer/${issuer.slug}`,
    noIndex: !multi,
    image: routeOgImage(`/issuer/${issuer.slug}`, title),
    keywords: [
      `${issuer.name} card`,
      `${issuer.name} crypto card`,
      `${issuer.name} card fees`,
      "crypto card comparison",
    ],
  });
}

export default async function IssuerPage({ params }: Props) {
  const { slug } = await params;
  const issuer = issuerBySlug.get(slug);
  if (!issuer) notFound();

  const multi = issuer.cards.length > 1;
  const bestCashback = issuer.topCard;
  const kycLevels = [...new Set(issuer.cards.map((card) => kycLabel[card.kycLevel]))];
  const custodyModels = [...new Set(issuer.cards.map((card) => custodyLabel[card.custodyModel]))];

  const faqs = [
    {
      q: `How many cards does ${issuer.name} offer?`,
      a: `We track ${plural(issuer.cards.length, "card")} from ${issuer.name}. ${multi ? "The table above compares every tier on fees, rewards, limits and supported assets." : `See the full spec sheet above for ${issuer.topCard.name}.`}`,
    },
    {
      q: `Does ${issuer.name} require KYC?`,
      a: `${issuer.name} cards are issued at ${kycLevels.join(" and ").toLowerCase()} level. Custody model: ${custodyModels.join(" and ").toLowerCase()}. Requirements can differ between tiers, so check the row that matches the card you want.`,
    },
    {
      q: `Which ${issuer.name} card pays the most cashback?`,
      a: `${bestCashback.name} pays ${cashbackLabel(bestCashback)}, with rewards in ${bestCashback.payoutToken}. Staking requirement: ${bestCashback.stakingRequirement}.`,
    },
    {
      q: `What crypto can I top up a ${issuer.name} card with?`,
      a: `Across the programme, ${issuer.name} cards accept ${issuer.supportedCryptos.slice(0, 8).join(", ")}${issuer.supportedCryptos.length > 8 ? ` and ${issuer.supportedCryptos.length - 8} more` : ""}, settling on ${issuer.supportedChains.slice(0, 5).join(", ")}.`,
    },
  ];

  const related = issuers.filter((item) => item.slug !== issuer.slug && item.cards.length > 1).slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(`${issuer.name} crypto cards`, issuer.cards)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Issuers", path: "/issuer" },
              { name: issuer.name, path: `/issuer/${issuer.slug}` },
            ]),
          ),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />

      <div className="border-b border-border bg-background/60">
        <div className="container-page flex items-center gap-1.5 overflow-x-auto py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Crypto Card</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href="/issuer" className="hover:text-foreground">Issuers</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="truncate font-medium text-muted-foreground">{issuer.name}</span>
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-border">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-page relative py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Landmark className="h-3 w-3" /> Card issuer · {issuer.domain}
            </div>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              {multi ? `Compare ${issuer.name} cards` : `${issuer.name} card`}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {multi
                ? `${issuer.name} runs ${plural(issuer.cards.length, "card programme")}. Compare every tier on fees, rewards, limits and supported assets — ordered cheapest first.`
                : `${issuer.topCard.name} — the full spec sheet: ${cashbackLabel(issuer.topCard)}, ${feeLabel(issuer.topCard.annualFeeUsd)} annual fee, available in ${issuer.topCard.supportedCountries.length} countries.`}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Badge>{plural(issuer.cards.length, "card")}</Badge>
              <Badge>{issuer.countryCount} countries</Badge>
              <Badge>{issuer.supportedCryptos.length} top-up tokens</Badge>
              <Badge>Top score {issuer.topCard.ratingScore.toFixed(1)}/10</Badge>
            </div>
          </div>
        </div>
      </section>

      {multi && (
        <section className="container-page pt-8">
          <WinnerSummary cards={issuer.cards} />
        </section>
      )}

      <section className="container-page mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {multi ? `${issuer.name} cards compared` : "Full specification"}
        </h2>
        <div className="mt-3">
          <ComparisonMatrix cards={issuer.cards} />
        </div>
      </section>

      <section className="container-page mt-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">Supported cryptocurrencies</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {issuer.supportedCryptos.map((symbol) => (
                <span key={symbol} className="rounded-full border border-border bg-background px-2.5 py-1 font-mono text-xs text-muted-foreground">
                  {symbol}
                </span>
              ))}
            </div>
            <h3 className="mt-5 text-sm font-semibold text-foreground">Settlement chains</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {issuer.supportedChains.map((chain) => (
                <span key={chain} className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                  {chain}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">Frequently asked</h2>
            <div className="mt-1 divide-y divide-border">
              {faqs.map((faq) => (
                <details key={faq.q} className="group py-2.5">
                  <summary className="flex cursor-pointer items-center justify-between gap-2 text-xs font-semibold text-foreground">
                    {faq.q}
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-1 pr-4 text-xs leading-4 text-muted-foreground">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-14 border-t border-border pt-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Other issuers with multiple cards</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/issuer/${item.slug}`}
                  className="rounded-lg border border-border bg-card px-4 py-3 text-xs font-medium text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                >
                  {item.name} · {plural(item.cards.length, "card")}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
