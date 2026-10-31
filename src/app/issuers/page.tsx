import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight, Layers, ShieldCheck } from "lucide-react";
import { cards } from "@/lib/data";
import { buildMetadata, breadcrumbJsonLd, routeOgImage } from "@/lib/seo";
import { cardsOnRail, infraProviders } from "@/lib/infra";
import { plural } from "@/lib/format";
import { Badge } from "@/components/ui";

export const metadata: Metadata = buildMetadata({
  title: `Crypto card issuing rails & infrastructure (${infraProviders.length} providers)`,
  description:
    "The regulated issuers behind crypto cards: Rain, Baanx, Monavate, DiPocket and more — which cards run on each rail, licences held, and why same-rail KYC matters.",
  path: "/issuers",
  image: routeOgImage("/issuers", "Crypto card issuing rails"),
  keywords: ["card issuing rail", "cards powered by monavate", "rain card infrastructure", "crypto card issuer", "BIN sponsor crypto card"],
});

export default function IssuersIndexPage() {
  const withCards = infraProviders
    .map((provider) => ({ provider, powered: cardsOnRail(provider, cards) }))
    .sort((a, b) => b.powered.length - a.powered.length);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Card issuers", path: "/issuers" },
            ]),
          ),
        }}
      />

      <div className="border-b border-border bg-background/60">
        <div className="container-page flex items-center gap-1.5 py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Crypto Card</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="font-medium text-muted-foreground">Card issuers</span>
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-border">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-page relative py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Layers className="h-3 w-3" /> Issuing rails · {infraProviders.length} providers
            </div>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              Who actually issues your crypto card?
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              The logo on the card is the brand — the licence on the back is the issuer. These are the regulated
              rails that power crypto cards, the licences each one holds, and every card running on them.
              Same-rail cards often share KYC, so switching between them is usually smoother than starting over.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {withCards.map(({ provider, powered }) => (
          <Link
            key={provider.slug}
            href={`/issuers/${provider.slug}`}
            className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold tracking-tight text-foreground group-hover:text-brand">
                {provider.name}
              </h2>
              <Badge>{plural(powered.length, "card")}</Badge>
            </div>
            <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">{provider.description}</p>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3 text-emerald-400" />
              {provider.licenses}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand">
              Cards on this rail <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>
    </>
  );
}
