import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Landmark } from "lucide-react";
import { issuers } from "@/lib/issuers";
import { buildMetadata, breadcrumbJsonLd, routeOgImage } from "@/lib/seo";
import { cashbackLabel, plural } from "@/lib/format";
import { Badge } from "@/components/ui";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: `Crypto card issuers (${issuers.length} programmes)`,
    description: `Compare all ${issuers.length} crypto card issuers side by side — every card each programme offers, ranked on fees, cashback and limits.`,
    path: "/issuer",
    image: routeOgImage("/issuer", "Crypto card issuers"),
    keywords: ["crypto card issuers", "card programmes", "crypto card companies"],
  });
}

export default function IssuersIndex() {
  const multi = issuers.filter((issuer) => issuer.cards.length > 1);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Issuers", path: "/issuer" },
            ]),
          ),
        }}
      />

      <div className="border-b border-border bg-background/60">
        <div className="container-page flex items-center gap-1.5 overflow-x-auto py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Crypto Card</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="font-medium text-muted-foreground">Issuers</span>
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-border">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-page relative py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Landmark className="h-3 w-3" /> Issuer directory
            </div>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              Crypto card issuers
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {issuers.length} card programmes tracked. Issuers with multiple cards show a full
              side-by-side comparison of every tier they offer.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Badge>{issuers.length} issuers</Badge>
              <Badge>{multi.length} with multiple cards</Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {issuers.map((issuer) => (
            <Link
              key={issuer.slug}
              href={`/issuer/${issuer.slug}`}
              className="group rounded-xl border border-border bg-card p-4 transition hover:border-foreground/25"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold text-foreground group-hover:text-foreground">
                  {issuer.name}
                </h2>
                <span className="text-[10px] text-muted-foreground">{issuer.domain}</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {plural(issuer.cards.length, "card")} · {cashbackLabel(issuer.topCard)} best ·{" "}
                {issuer.countryCount} countries
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1">
                {issuer.supportedCryptos.slice(0, 5).map((symbol) => (
                  <span key={symbol} className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {symbol}
                  </span>
                ))}
                {issuer.supportedCryptos.length > 5 && (
                  <span className="rounded px-1 py-0.5 text-[10px] text-muted-foreground">
                    +{issuer.supportedCryptos.length - 5}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
