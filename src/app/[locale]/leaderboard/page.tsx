import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ChevronRight, Trophy } from "lucide-react";
import { AS_OF, entries } from "@/lib/leaderboard";
import { buildMetadata, breadcrumbJsonLd, itemListJsonLd, routeOgImage } from "@/lib/seo";
import { Heavyweights } from "@/components/leaderboard/heavyweights";

export const metadata: Metadata = buildMetadata({
  title: `Crypto card leaderboard — ${entries.length} programs ranked`,
  description:
    "Rank crypto cards on real settlement data, not marketing: 30-day volume, annualized run-rates, cumulative throughput and market share across the heavyweight crypto card programs.",
  path: "/leaderboard",
  image: routeOgImage("/leaderboard", "Crypto card leaderboard"),
  keywords: [
    "crypto card leaderboard",
    "crypto card volume",
    "on-chain card spend",
    "crypto card rankings",
    "stablecoin card stats",
  ],
});

export default function LeaderboardPage() {
  const catalogLinked = entries.filter((e) => e.cardSlug).map((e) => ({ name: e.name, slug: e.cardSlug! }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Leaderboard", path: "/leaderboard" },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd("Crypto card leaderboard", catalogLinked)),
        }}
      />

      <div className="border-b border-border bg-background/60">
        <div className="container-page flex items-center gap-1.5 py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Crypto Card</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="font-medium text-muted-foreground">Leaderboard</span>
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-border">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-page relative py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Trophy className="h-3 w-3" /> Leaderboard · {AS_OF}
            </div>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              Crypto card leaderboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Total volume alone can't rank cards fairly — custodial programs book deposits while self-custodial cards
              settle swipe-by-swipe on-chain. The leaderboard separates the heavyweights by verified spend, annualized
              run-rate, and cumulative throughput — not marketing claims.
            </p>
          </div>
        </div>
      </section>

      <div className="container-page pb-16">
        <Heavyweights />

        <section className="mt-14 rounded-xl border border-border bg-muted/40 p-5 text-xs leading-5 text-muted-foreground">
          <h3 className="text-sm font-semibold text-foreground">Methodology & sources</h3>
          <p className="mt-2">
            Figures cover {AS_OF} and are distilled from Paymentscan-indexed settlement data (the 30 programs in the
            October 2026 volume ranking, of 32 tracked across 21 chains) combined with card-program fee audits. Volume includes issuer-reported feeds for
            custodial programs (RedotPay, BFinance) alongside swipe-by-swipe on-chain settlement for self-custodial
            cards; annualized run-rate extrapolates monthly volume × 365/30. Rows link to Rituel card reviews where a
            matching program exists in our catalog. Data is a point-in-time snapshot — verify against the issuer
            before relying on any figure.
          </p>
        </section>
      </div>
    </>
  );
}
