import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Coins, Network } from "lucide-react";
import { cards } from "@/lib/data";
import { buildMetadata, titleWithCount, breadcrumbJsonLd, faqJsonLd, itemListJsonLd, routeOgImage } from "@/lib/seo";
import { cryptoPages, featuredPairs, type CryptoPage } from "@/lib/taxonomy";
import { cryptoPath } from "@/lib/paths";
import { cashbackLabel, pct, plural } from "@/lib/format";
import { Directory } from "@/components/directory/directory";
import { Badge } from "@/components/ui";

const KIND_CONFIG = {
  token: { label: "Tokens", indexPath: "/tokens", badge: "Token directory", icon: Coins },
  chain: { label: "Chains", indexPath: "/chains", badge: "Chain directory", icon: Network },
} as const;

export function assetMetadata(page: CryptoPage): Metadata {
  const matched = cards.filter(page.filter);
  const path = cryptoPath(page);
  return buildMetadata({
    title: titleWithCount(page.title, matched.length),
    description: `${page.description} ${plural(matched.length, "card")} tracked for 2026.`,
    path,
    image: routeOgImage(path, page.title),
    keywords: [page.heading.toLowerCase(), `${page.label} crypto card`, "crypto card comparison"],
  });
}

export async function AssetPage({ page }: { page: CryptoPage }) {
  const config = KIND_CONFIG[page.kind];
  const pagePath = cryptoPath(page);
  const matched = cards.filter(page.filter).sort((a, b) => b.ratingScore - a.ratingScore);
  if (matched.length === 0) notFound();

  const bestCashback = [...matched].sort((a, b) => b.cashbackMaxPct - a.cashbackMaxPct)[0];
  const cheapestFx = [...matched].sort((a, b) => a.fxFeePct - b.fxFeePct)[0];
  const noKyc = matched.filter((card) => card.kycLevel === "no_kyc").length;
  const zeroFx = matched.filter((card) => card.fxFeePct === 0).length;
  const related = cryptoPages
    .filter((item) => item.slug !== page.slug && item.kind === page.kind)
    .slice(0, 6);
  const pairs = featuredPairs
    .filter((pair) => matched.some((card) => card.slug === pair.a.slug || card.slug === pair.b.slug))
    .slice(0, 4);

  const faqs = [
    {
      q: `Which crypto cards support ${page.label}?`,
      a: `${plural(matched.length, "card")} in our database accept ${page.label}: ${matched.map((card) => card.name).join(", ")}. Support can vary by region, so confirm the asset list for your country with the issuer.`,
    },
    {
      q: `What is the cheapest way to spend ${page.label}?`,
      a: `${cheapestFx.name} has the lowest FX fee in this group at ${pct(cheapestFx.fxFeePct)}, with a ${pct(cheapestFx.topupFeePct)} top-up fee. ${bestCashback.name} pays the highest cashback at ${pct(bestCashback.cashbackMaxPct)}. Run the net return calculator to compare for your actual spend.`,
    },
    {
      q: `Do I need to convert ${page.label} to USD before spending?`,
      a:
        page.kind === "token"
          ? `It depends on the card. Self-custody cards typically convert ${page.label} at settlement, while custodial cards require you to top up a fiat or stablecoin balance first. The top-up fee column captures that conversion cost.`
          : `No. If a card supports ${page.label}, you can usually top up in a token on that chain and the issuer handles settlement. Check the top-up fee and whether the chain is supported for your asset.`,
    },
    {
      q: `Are there no-KYC cards for ${page.label}?`,
      a:
        noKyc > 0
          ? `Yes, ${noKyc} card${noKyc === 1 ? "" : "s"} in this list offer a no-KYC tier, usually capped at around $1,000. Above the cap, identity verification is required.`
          : `We do not currently track a no-KYC card that supports ${page.label}. The cards listed here require at least light KYC.`,
    },
  ];

  const Icon = config.icon;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(page.title, matched)) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: config.label, path: config.indexPath },
              { name: page.label, path: pagePath },
            ]),
          ),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />

      <div className="border-b border-border bg-background/60">
        <div className="container-page flex items-center gap-1.5 overflow-x-auto py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Crypto Card</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href={config.indexPath} className="hover:text-foreground">{config.label}</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="truncate font-medium text-muted-foreground">{page.label}</span>
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-border">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-page relative py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Icon className="h-3 w-3" />
              {config.badge}
            </div>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              {page.heading}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{page.intro}</p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Badge>{plural(matched.length, "card")}</Badge>
              <Badge>Top cashback {pct(bestCashback.cashbackMaxPct)}</Badge>
              <Badge>{zeroFx} with 0% FX</Badge>
              <Badge>{noKyc} no-KYC option{noKyc === 1 ? "" : "s"}</Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="pt-8">
        <Directory
          allCards={matched}
          showHeading
          heading={`Cards that support ${page.label}`}
          subheading={`${matched.length} programmes accept ${page.label}. Switch to table view to sort on fees.`}
          syncUrl
          source={`asset-${page.slug}`}
          id="asset-directory"
        />
      </div>

      <section className="container-page mt-12">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Spending {page.label} — what to check
            </h2>
            <div className="mt-2 space-y-2 text-sm leading-5 text-muted-foreground">
              <p>
                <strong className="font-semibold text-foreground">Top-up fee:</strong> the cost of converting {page.label}{" "}
                into spendable balance. It ranges from 0% on {matched.filter((card) => card.topupFeePct === 0).length}{" "}
                cards to {pct(Math.max(...matched.map((card) => card.topupFeePct)))}.
              </p>
              <p>
                <strong className="font-semibold text-foreground">Supported chain:</strong> if you hold {page.label} on a
                chain the issuer does not support, you will need to bridge or swap first — which can cost more than
                the card fee itself.
              </p>
              <p>
                <strong className="font-semibold text-foreground">FX:</strong> a card can be cheap for USD spend but
                expensive abroad. {cheapestFx.name} is the lowest-FX option in this group at {pct(cheapestFx.fxFeePct)}.
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Mini label="Top cashback" value={cashbackLabel(bestCashback)} />
              <Mini label="Lowest FX" value={pct(cheapestFx.fxFeePct)} />
              <Mini label="No-KYC" value={String(noKyc)} />
              <Mini label="Avg. score" value={`${(matched.reduce((sum, card) => sum + card.ratingScore, 0) / matched.length).toFixed(1)}/10`} />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">{page.label} — FAQ</h2>
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

        {pairs.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Compare cards in this group</h2>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {pairs.map((pair) => (
                <Link
                  key={pair.slug}
                  href={`/compare/${pair.slug}`}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                >
                  {pair.a.name} vs {pair.b.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Related {config.label.toLowerCase()}</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={cryptoPath(item)}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:border-foreground/20 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate text-xs font-semibold text-foreground">{value}</div>
    </div>
  );
}
