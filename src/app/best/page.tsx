import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight, Trophy } from "lucide-react";
import { cards } from "@/lib/data";
import { buildMetadata, breadcrumbJsonLd, routeOgImage } from "@/lib/seo";
import { bestPages } from "@/lib/taxonomy";
import { plural } from "@/lib/format";
import { Badge } from "@/components/ui";

export const metadata: Metadata = buildMetadata({
  title: `Best crypto card lists — ${bestPages.length} curated rankings`,
  description:
    "Curated 'best' rankings of crypto cards by use case: self-custody, zero-FX travel, no-KYC, high cashback, stablecoin, business and more.",
  path: "/best",
  image: routeOgImage("/best", "Best crypto card lists"),
  keywords: ["best crypto cards", "crypto card comparison", "best bitcoin card", "crypto card rankings"],
});

export default function BestIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Best lists", path: "/best" },
            ]),
          ),
        }}
      />
      <div className="border-b border-border bg-background/60">
        <div className="container-page flex items-center gap-1.5 py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Crypto Card</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="font-medium text-muted-foreground">Best lists</span>
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-border">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-page relative py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Trophy className="h-3 w-3" /> Best lists · {bestPages.length} rankings
            </div>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              Best crypto cards, by use case
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              "Best" depends on what you need — zero-FX travel, self-custody, cashback, business use.
              Each ranking is filtered from the live database and re-verified on a rolling basis.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bestPages.map((page) => {
          const count = cards.filter(page.filter).length;
          return (
            <Link
              key={page.slug}
              href={`/best/${page.slug}-crypto-cards`}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold tracking-tight text-foreground group-hover:text-brand">
                  {page.heading}
                </h2>
                <Badge>{plural(count, "card")}</Badge>
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">{page.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand">
                View ranking <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </section>
    </>
  );
}
