import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Check, ChevronRight, Scale, Sparkles } from "lucide-react";
import { cardBySlug } from "@/lib/data";
import { cashbackLabel, feeLabel, pct } from "@/lib/format";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { featuredPairs } from "@/lib/taxonomy";
import { cn } from "@/lib/cn";
import { ComparisonMatrix, WinnerSummary } from "@/components/compare/comparison-matrix";
import { AffiliateLink } from "@/components/affiliate-link";
import { Badge, CardArt } from "@/components/ui";

type Props = { params: Promise<{ pair: string }> };

function resolvePair(pair: string) {
  const slugs = pair.split("-vs-");
  const resolved = slugs.map((slug) => cardBySlug.get(slug)).filter((card) => Boolean(card));
  return { slugs, cards: resolved };
}

export async function generateStaticParams() {
  return featuredPairs.map((pair) => ({ pair: pair.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const { cards: matched } = resolvePair(pair);
  if (matched.length < 2) return {};
  const names = matched.map((card) => card?.name).join(" vs ");
  return buildMetadata({
    title: `${names} — Which Crypto Card Is Better? (2026)`,
    description: `Compare ${names} on fees, cashback, FX, KYC and country availability. See the winner for every metric.`,
    path: `/compare/${pair}`,
    keywords: [`${matched[0]?.name} vs ${matched[1]?.name}`, "crypto card comparison"],
  });
}

export default async function ComparePage({ params }: Props) {
  const { pair } = await params;
  const { cards: matched } = resolvePair(pair);
  if (matched.length < 2 || matched.length > 4) notFound();

  const compared = matched as NonNullable<(typeof matched)[number]>[];
  const [a, b] = compared;

  const faqs = [
    {
      q: `Which is better, ${compared.map((card) => card.name).join(" or ")}?`,
      a: `${compared
        .slice()
        .sort((x, y) => y.ratingScore - x.ratingScore)[0].name} has the higher editor score. ${a.name} pays ${cashbackLabel(a)} with ${pct(a.fxFeePct)} FX, while ${b.name} pays ${cashbackLabel(b)} with ${pct(b.fxFeePct)} FX. The right choice depends on whether you value cashback, low FX, self-custody or country availability more.`,
    },
    {
      q: `Which card has lower fees, ${a.name} or ${b.name}?`,
      a: `${a.name} has a ${feeLabel(a.annualFeeUsd, "no annual fee")} annual fee, ${pct(a.topupFeePct)} top-up fee and ${pct(a.fxFeePct)} FX. ${b.name} has a ${feeLabel(b.annualFeeUsd, "no annual fee")} annual fee, ${pct(b.topupFeePct)} top-up fee and ${pct(b.fxFeePct)} FX. The winner depends on your spend currency and funding token; run the net return calculator for your own numbers.`,
    },
    {
      q: `Can I use ${a.name} and ${b.name} together?`,
      a: `Yes, in most jurisdictions there is no restriction on holding multiple crypto cards. A common setup is using the lowest-FX card for travel and the highest-cashback card for domestic or online spend.`,
    },
  ];

  const bestCashback = [a, b].sort((x, y) => y.cashbackMaxPct - x.cashbackMaxPct)[0];
  const bestFx = [a, b].sort((x, y) => x.fxFeePct - y.fxFeePct)[0];
  const bestAnnual = [a, b].sort((x, y) => x.annualFeeUsd - y.annualFeeUsd)[0];

  const others = featuredPairs
    .filter((item) => item.slug !== pair)
    .filter((item) => compared.some((card) => item.a.slug === card.slug || item.b.slug === card.slug))
    .slice(0, 3);
  const fallback = featuredPairs.filter((item) => item.slug !== pair).slice(0, 3);
  const related = others.length > 0 ? others : fallback;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Compare", path: "/compare" },
              { name: compared.map((card) => card.name).join(" vs "), path: `/compare/${pair}` },
            ]),
          ),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />

      <div className="border-b border-border bg-background/60">
        <div className="container-page flex items-center gap-1.5 overflow-x-auto py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Crypto Card</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href="/compare" className="hover:text-foreground">Compare</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="truncate font-medium text-muted-foreground">
            {compared.map((card) => card.name).join(" vs ")}
          </span>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge><Scale className="h-3 w-3" /> Head-to-head</Badge>
          <Badge>Updated October 2026</Badge>
          {compared.some((card) => card.isSponsored) && <Badge>Includes sponsored card</Badge>}
        </div>

        <h1 className="mt-3 flex flex-wrap items-center gap-2 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
          {compared.map((card, index) => (
            <span key={card.slug} className="inline-flex items-center gap-2">
              {index > 0 && <span className="text-base font-normal text-muted-foreground">vs</span>}
              <Link href={`/card/${card.slug}`} className="hover:text-foreground">{card.name}</Link>
            </span>
          ))}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          A metric-by-metric comparison based on published fees and limits. “Best” means the lowest cost or
          highest reward in that row — not an editorial endorsement.
        </p>

        <div className="mt-5">
          <WinnerSummary cards={compared} />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <ComparisonMatrix cards={compared} />
            </div>

            <div className="mt-6 rounded-xl border border-border bg-card p-5">
              <h2 className="text-lg font-medium tracking-tight text-foreground">The quick verdict</h2>
              <div className="mt-3 space-y-2 text-sm leading-5 text-muted-foreground">
                <p>
                  <strong className="font-medium text-foreground">{bestCashback.name}</strong> pays the highest headline
                  cashback at {pct(bestCashback.cashbackMaxPct)}, but check the staking requirement:{" "}
                  {bestCashback.stakingRequirement.toLowerCase()}.
                </p>
                <p>
                  <strong className="font-medium text-foreground">{bestFx.name}</strong> is the cheaper travel card at{" "}
                  {pct(bestFx.fxFeePct)} FX, while {bestAnnual.name} wins on annual cost at{" "}
                  {feeLabel(bestAnnual.annualFeeUsd, "$0")}.
                </p>
                <p>
                  Both cards are available in {a.supportedCountries.length} and {b.supportedCountries.length}{" "}
                  countries respectively. If your country is not on one of those lists, the choice is already
                  made for you.
                </p>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {compared.map((card) => (
                  <div key={card.slug} className="rounded-xl border border-border p-3">
                    <div className="flex items-center gap-2">
                      <CardArt card={card} className="h-8 w-12 shrink-0" />
                      <div className="min-w-0">
                        <Link href={`/card/${card.slug}`} className="block truncate text-sm font-medium text-foreground hover:text-foreground">
                          {card.name}
                        </Link>
                        <div className="text-[10px] text-muted-foreground">{card.issuerName}</div>
                      </div>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {card.pros.slice(0, 2).map((pro) => (
                        <li key={pro} className="flex gap-1 text-xs leading-4 text-muted-foreground">
                          <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" /> {pro}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 flex gap-1.5">
                      <Link
                        href={`/card/${card.slug}`}
                        className="inline-flex h-8 flex-1 items-center justify-center rounded-md border border-border text-xs font-medium text-foreground hover:border-foreground/20"
                      >
                        Review
                      </Link>
                      <AffiliateLink
                        slug={card.slug}
                        cardName={card.name}
                        source="compare-verdict"
                        className="inline-flex h-8 flex-1 items-center justify-center gap-0.5 rounded-md bg-primary text-xs font-medium text-primary-foreground hover:bg-primary/80"
                      >
                        Get card <ArrowUpRight className="h-2.5 w-2.5" />
                      </AffiliateLink>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-card p-5">
              <h2 className="text-lg font-medium tracking-tight text-foreground">
                {compared.map((card) => card.name).join(" vs ")} — FAQ
              </h2>
              <div className="mt-2 divide-y divide-border">
                {faqs.map((faq) => (
                  <details key={faq.q} className="group py-3">
                    <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium text-foreground">
                      {faq.q}
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-1.5 pr-6 text-xs leading-5 text-muted-foreground">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <Sparkles className="h-3 w-3" /> Run your numbers
              </div>
              <h2 className="mt-1 text-sm font-medium leading-5 text-foreground">
                Fees only matter at your spend level.
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Use the net return calculator to account for top-up fees, FX and annual fees with your actual
                monthly spend.
              </p>
              <Link
                href="/#calculator"
                className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1 rounded-lg bg-primary text-xs font-medium text-primary-foreground hover:bg-primary/80"
              >
                Open calculator <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">More comparisons</h2>
              <div className="mt-2 space-y-1">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/compare/${item.slug}`}
                    className="block rounded-lg px-1.5 py-2 transition hover:bg-muted"
                  >
                    <span className="block truncate text-xs font-medium text-foreground">
                      {item.a.name} <span className="font-normal text-muted-foreground">vs</span> {item.b.name}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      {cashbackLabel(item.a)} vs {cashbackLabel(item.b)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Review pages</h2>
              <div className="mt-2 space-y-1">
                {compared.map((card) => (
                  <Link
                    key={card.slug}
                    href={`/card/${card.slug}`}
                    className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-muted"
                  >
                    <CardArt card={card} className="h-7 w-10 shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">{card.name}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <Link href="/" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground hover:border-foreground/20">
            ← Back to directory
          </Link>
          <Link href="/compare" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground hover:border-foreground/20">
            Build a new comparison
          </Link>
          {compared.map((card) => (
            <Link
              key={card.slug}
              href={`/card/${card.slug}`}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {card.name} review
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
