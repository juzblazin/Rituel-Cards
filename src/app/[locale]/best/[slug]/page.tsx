import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, Crown, Sparkles, Trophy } from "lucide-react";
import { cards, kycLabel, networkLabel } from "@/lib/data";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd, itemListJsonLd, routeOgImage } from "@/lib/seo";
import { bestPageFromSlug, bestPages } from "@/lib/taxonomy";
import { cashbackLabel, feeLabel, pct, plural } from "@/lib/format";
import { Directory } from "@/components/directory/directory";
import { AffiliateLink } from "@/components/affiliate-link";
import { Badge, Rating } from "@/components/ui";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return bestPages.map((page) => ({ slug: `${page.slug}-crypto-cards` }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = bestPageFromSlug(slug);
  if (!page) return {};
  const matched = cards.filter(page.filter);
  return buildMetadata({
    title: `${page.title} (${matched.length})`,
    description: page.description,
    path: `/best/${slug}`,
    image: routeOgImage(`/best/${slug}`, page.title),
    keywords: [page.keyword, "best crypto card", "crypto debit card", "crypto card comparison"],
  });
}

export default async function BestPageRoute({ params }: Props) {
  const { slug } = await params;
  const page = bestPageFromSlug(slug);
  if (!page) notFound();

  const matched = cards.filter(page.filter);
  if (matched.length === 0) notFound();

  const top = [...matched].sort((a, b) => b.ratingScore - a.ratingScore).slice(0, 3);
  const rest = bestPages.filter((other) => other.slug !== page.slug);
  const faqs = [
    ...page.faqs,
    {
      q: `How many ${page.heading.replace(/^Best /, "").toLowerCase()} are there?`,
      a: `We currently track ${plural(matched.length, "crypto card")} in this category, re-verified against issuer documentation on a rolling basis.`,
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(page.title, matched)) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Best lists", path: "/best" },
              { name: page.heading, path: `/best/${slug}` },
            ]),
          ),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />

      <div className="border-b border-border bg-background/60">
        <div className="container-page flex items-center gap-1.5 overflow-x-auto py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Crypto Card</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href="/best" className="hover:text-foreground">Best lists</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="truncate font-medium text-muted-foreground">{page.heading}</span>
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-border">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-page relative py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3 w-3" /> Best list · {matched.length} cards
            </div>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              {page.heading}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{page.intro}</p>
          </div>
        </div>
      </section>

      <div className="pt-8">
        <Directory
          allCards={matched}
          showHeading
          heading={page.heading}
          subheading={`${plural(matched.length, "card")} in this category. Filters stay within the list.`}
          syncUrl
          source={`best-${page.slug}`}
          id="best-directory"
        />
      </div>

      <section className="container-page mt-14">
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-amber-400" />
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Top {top.length} picks</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Ranked by our verified score, then fee profile.</p>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {top.map((card, index) => (
            <article
              key={card.slug}
              className={cn(
                "relative flex flex-col rounded-xl border bg-card p-5",
                index === 0 ? "border-amber-400/50 ring-1 ring-amber-400/20" : "border-border",
              )}
            >
              {index === 0 && (
                <span className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-950">
                  <Crown className="size-3" /> Best overall
                </span>
              )}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold leading-tight tracking-tight">
                  <Link href={`/crypto-card/${card.slug}`} className="hover:text-brand">
                    {card.name}
                  </Link>
                </h3>
                <span className="shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  #{index + 1}
                </span>
              </div>
              <Rating score={card.ratingScore} className="mt-1.5" />
              <p className="mt-3 flex-1 text-sm leading-5 text-muted-foreground">{card.tagline}</p>

              <dl className="mt-4 grid grid-cols-2 gap-2.5 border-t border-border pt-4 text-xs">
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Cashback</dt>
                  <dd className="mt-0.5 font-semibold text-foreground">{cashbackLabel(card)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">FX fee</dt>
                  <dd className="mt-0.5 font-semibold text-foreground">{pct(card.fxFeePct)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Annual</dt>
                  <dd className="mt-0.5 font-semibold text-foreground">{feeLabel(card.annualFeeUsd, "None")}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">KYC</dt>
                  <dd className="mt-0.5 font-semibold text-foreground">{kycLabel[card.kycLevel]}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Network</dt>
                  <dd className="mt-0.5 font-semibold text-foreground">{networkLabel[card.network]}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Issuer</dt>
                  <dd className="mt-0.5 truncate font-semibold text-foreground">{card.issuerName}</dd>
                </div>
              </dl>

              <div className="mt-4 flex items-center gap-2">
                <AffiliateLink slug={card.slug} cardName={card.name} source={`best-${page.slug}`} className={cn(buttonVariants({ size: "sm" }), "flex-1")}>
                  Get card
                </AffiliateLink>
                <Link
                  href={`/crypto-card/${card.slug}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}
                >
                  Full review
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page mt-14 rounded-xl border border-border bg-card p-5 sm:p-7">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Frequently asked questions</h2>
        <dl className="mt-5 space-y-5">
          {faqs.map((faq) => (
            <div key={faq.q}>
              <dt className="text-sm font-semibold text-foreground">{faq.q}</dt>
              <dd className="mt-1.5 text-sm leading-6 text-muted-foreground">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-page mt-14 border-t border-border pt-10">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">More best lists</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {rest.map((other) => (
            <Link
              key={other.slug}
              href={`/best/${other.slug}-crypto-cards`}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
            >
              {other.heading} <ArrowRight className="size-3" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
