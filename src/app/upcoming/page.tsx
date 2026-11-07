import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight, Clock } from "lucide-react";
import { cards } from "@/lib/data";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { cardPath } from "@/lib/paths";
import { pct, feeLabel, plural } from "@/lib/format";
import { Badge, CardArt, Rating } from "@/components/ui";

const UPCOMING_STATUSES = new Set(["waitlist", "beta"]);
const ARCHIVED_STATUSES = new Set(["paused", "discontinued"]);

export const metadata: Metadata = buildMetadata({
  title: "Upcoming Crypto Cards — Waitlist & Pre-Launch Tracker",
  description:
    "Track crypto cards in waitlist, beta and pre-launch. Status, expected availability and issuer details for programmes that haven't shipped yet.",
  path: "/upcoming",
  keywords: ["upcoming crypto cards", "crypto card waitlist", "new crypto cards", "pre-launch crypto card"],
});

const breadcrumbs = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Upcoming cards", path: "/upcoming" },
]);

export default function UpcomingPage() {
  const upcoming = cards.filter((card) => card.status && UPCOMING_STATUSES.has(card.status));
  const archived = cards.filter((card) => card.status && ARCHIVED_STATUSES.has(card.status));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <div className="border-b border-border bg-background/60">
        <div className="container-page flex items-center gap-1.5 py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Crypto Card</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="font-medium text-muted-foreground">Upcoming</span>
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-border">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-page relative py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Clock className="h-3 w-3" /> Pre-launch tracker
            </div>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              Upcoming crypto cards
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Programmes in waitlist, beta or announced-but-not-shipped. We track their published fees and
              availability so you know what's coming — and what already slipped.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        {upcoming.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((card) => (
              <Link
                key={card.slug}
                href={cardPath(card.slug)}
                className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
              >
                <CardArt card={card} className="aspect-[1.58/1] w-full" />
                <div className="mt-4 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold tracking-tight text-foreground group-hover:text-brand">
                    {card.name}
                  </h2>
                  <Badge tone="amber">{card.status === "beta" ? "Beta" : "Waitlist"}</Badge>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{card.tagline}</p>
                <div className="mt-3 flex items-center gap-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
                  <span>Cashback {pct(card.cashbackMaxPct)}</span>
                  <span>FX {pct(card.fxFeePct)}</span>
                  <span>{feeLabel(card.annualFeeUsd, "No annual fee")}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Nothing in waitlist right now</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Every programme we track is live. When issuers announce new cards, they'll show up here with
              their published fee details before they ship.
            </p>
            <Link
              href="/cards"
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/80"
            >
              Browse {plural(cards.length, "live card")} <ArrowRight className="size-3.5" />
            </Link>
          </div>
        )}
      </section>

      {archived.length > 0 && (
        <section className="container-page pb-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Paused & discontinued
          </h2>
          <div className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
            {archived.map((card) => (
              <Link
                key={card.slug}
                href={cardPath(card.slug)}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <CardArt card={card} className="h-8 w-12 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{card.name}</span>
                <Rating score={card.ratingScore} className="text-xs" />
                <Badge tone="neutral">{card.status}</Badge>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
