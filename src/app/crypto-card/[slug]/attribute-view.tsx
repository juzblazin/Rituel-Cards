import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Sparkles } from "lucide-react";
import { cards } from "@/lib/data";
import { buildMetadata, titleWithCount, breadcrumbJsonLd, faqJsonLd, itemListJsonLd, routeOgImage } from "@/lib/seo";
import { attributeBySlug, attributePages, featuredPairs } from "@/lib/taxonomy";
import { cashbackLabel, pct, plural } from "@/lib/format";
import { Directory } from "@/components/directory/directory";
import { Badge } from "@/components/ui";

export async function attributeMetadata(slug: string): Promise<Metadata> {
  const page = attributeBySlug.get(slug);
  if (!page) return {};
  const matched = cards.filter(page.filter);
  return buildMetadata({
    title: titleWithCount(page.title, matched.length),
    description: `${page.description} ${plural(matched.length, "card")} tracked and updated for October 2026.`,
    path: `/crypto-card/${page.slug}`,
    image: routeOgImage(`/crypto-card/${page.slug}`, page.title),
    keywords: [page.heading.toLowerCase(), page.title.toLowerCase(), "crypto card comparison"],
  });
}

const EXTRA_FAQS: Record<string, { q: string; a: string }[]> = {
  "no-kyc": [
    {
      q: "Are no-KYC crypto cards legal?",
      a: "Card issuance is regulated even when the onboarding tier is light. No-KYC tiers are usually capped at low monthly limits, and issuers must still comply with local anti-money-laundering rules. Using a card to evade tax or sanctions is illegal in every market we cover.",
    },
    {
      q: "What happens when I hit the no-KYC limit?",
      a: "The issuer will ask you to complete identity verification before you can keep spending. Most programmes freeze new top-ups or decline transactions until the check is complete, rather than closing the account.",
    },
  ],
  "self-custody": [
    {
      q: "Are self-custody cards safer than exchange cards?",
      a: "They remove exchange counterparty risk because funds stay in your wallet until settlement. They do not remove smart-contract risk, key-management risk or issuer risk on the card programme itself. Self-custody is a different risk profile, not zero risk.",
    },
    {
      q: "Why is cashback lower on self-custody cards?",
      a: "Non-custodial programmes cannot earn a float on your balance, so they have less revenue to fund rewards. They also settle on-chain, which adds gas and liquidity costs that custodial issuers avoid.",
    },
  ],
  "high-cashback": [
    {
      q: "Is the headline cashback rate realistic?",
      a: "Usually only at the top tier, which requires a token stake or a subscription. We show the minimum and maximum rate, the payout token and the staking requirement so you can judge the real return. The calculator models the maximum tier and does not price token volatility.",
    },
    {
      q: "Are crypto card rewards taxable?",
      a: "In most jurisdictions, cashback paid in crypto is treated as income or a rebate at the time of receipt, and later price changes can create capital gains. Rules vary; consult a local tax adviser.",
    },
  ],
  "no-fx": [
    {
      q: "Is 0% FX really free?",
      a: "Check the weekend markup and the reference rate. Some cards advertise 0% but apply a 0.5–1% spread on weekends or use an unfavourable rate. We record the fee notes for every card rather than trusting the headline.",
    },
  ],
};

export async function AttributeView({ slug }: { slug: string }) {
  const page = attributeBySlug.get(slug);
  if (!page) notFound();

  const matched = cards.filter(page.filter).sort((a, b) => b.ratingScore - a.ratingScore);
  const avgRating = matched.reduce((sum, card) => sum + card.ratingScore, 0) / matched.length;
  const bestCashback = [...matched].sort((a, b) => b.cashbackMaxPct - a.cashbackMaxPct)[0];
  const zeroFx = matched.filter((card) => card.fxFeePct === 0).length;
  const relevantPairs = featuredPairs
    .filter((pair) => matched.some((card) => card.slug === pair.a.slug || card.slug === pair.b.slug))
    .slice(0, 4);

  const faqs = [
    {
      q: `How many ${page.heading.toLowerCase()} are there in 2026?`,
      a: `We currently track ${plural(matched.length, "card")} matching this guide, ${zeroFx} of which charge 0% FX. Counts are generated from the directory dataset and update whenever a card is added or its availability changes.`,
    },
    {
      q: `What is the highest cashback in this category?`,
      a: bestCashback
        ? `${bestCashback.name} offers ${cashbackLabel(bestCashback)}, paid in ${bestCashback.payoutToken}. Staking requirement: ${bestCashback.stakingRequirement}.`
        : "We do not currently track a card in this category.",
    },
    {
      q: `How are these cards ranked?`,
      a: "The default order sorts by editor score. Switch to table view to sort on raw fees, cashback or limits. Fees and calculator outputs always use the raw numbers.",
    },
    ...(EXTRA_FAQS[page.slug] ?? []),
  ];

  const related = attributePages.filter((item) => item.slug !== page.slug).slice(0, 4);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(page.title, matched)) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Guides", path: "/crypto-card" },
              { name: page.heading, path: `/crypto-card/${page.slug}` },
            ]),
          ),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />

      <div className="border-b border-border bg-background/60">
        <div className="container-page flex items-center gap-1.5 overflow-x-auto py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Crypto Card</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href="/crypto-card" className="hover:text-foreground">Guides</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="truncate font-medium text-muted-foreground">{page.heading}</span>
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-border">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-page relative py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3 w-3" /> {page.eyebrow} guide
            </div>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              {page.heading}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{page.intro}</p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Badge>{plural(matched.length, "card")} tracked</Badge>
              <Badge>Average score {avgRating.toFixed(1)}/10</Badge>
              <Badge>{zeroFx} with 0% FX</Badge>
              {bestCashback && <Badge>Top cashback {pct(bestCashback.cashbackMaxPct)}</Badge>}
            </div>
          </div>
        </div>
      </section>

      <div className="pt-8">
        <Directory
          allCards={matched}
          showHeading
          heading={page.heading}
          subheading={`${plural(matched.length, "card")} matching this guide. Filters stay within the category.`}
          syncUrl
          source={`guide-${page.slug}`}
          id="guide-directory"
        />
      </div>

      <section className="container-page mt-12">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">How we built this guide</h2>
            <p className="mt-2 text-sm leading-5 text-muted-foreground">
              {page.description} We start from the published fee schedule, then normalise top-up and FX fees to
              basis points so a 0.5% spread is directly comparable across issuers. Cards with unclear fee notes are
              marked as such rather than assumed to be free.
            </p>
            <p className="mt-2 text-sm leading-5 text-muted-foreground">
              Filtering is applied before ranking, so a card never appears in a category it does not qualify for. Read
              the full{" "}
              <Link href="/methodology" className="font-medium text-foreground underline underline-offset-4">methodology</Link>.
            </p>
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

        {relevantPairs.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Compare cards in this guide</h2>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {relevantPairs.map((pair) => (
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
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Related guides</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/crypto-card/${item.slug}`}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:border-foreground/20 hover:text-foreground"
              >
                {item.heading}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
