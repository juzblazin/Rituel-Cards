import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight, CreditCard } from "lucide-react";
import { cards } from "@/lib/data";
import { breadcrumbJsonLd, buildMetadata, itemListJsonLd } from "@/lib/seo";
import { plural } from "@/lib/format";
import { Directory } from "@/components/directory/directory";

export const metadata: Metadata = buildMetadata({
  title: `All Crypto Cards (${cards.length}) — Fees, Cashback & Availability`,
  description:
    "Every crypto debit, credit and prepaid card we track, with real fees, cashback rates, KYC requirements and country availability.",
  path: "/cards",
  keywords: ["crypto cards", "crypto debit card", "crypto credit card", "crypto card list"],
});

const breadcrumbs = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Cards", path: "/cards" },
]);

export default function CardsIndexPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd("All crypto cards", cards)) }} />

      <div className="border-b border-border bg-background/60">
        <div className="container-page flex items-center gap-1.5 py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Crypto Card</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="font-medium text-muted-foreground">Cards</span>
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-border">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-page relative py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <CreditCard className="h-3 w-3" /> Card reviews · {cards.length} programmes
            </div>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              Every crypto card, reviewed
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {plural(cards.length, "card")} with normalised fees, cashback and availability — each with its own
              in-depth review. Filter below, or start with a curated best list.
            </p>
          </div>
        </div>
      </section>

      <div className="pt-8">
        <Directory
          allCards={cards}
          showHeading
          heading="All crypto cards"
          subheading={`${plural(cards.length, "card")} tracked. Filters, sort and country state stay in the URL.`}
          syncUrl
          source="cards-index"
          id="cards-directory"
        />
      </div>

      <section className="container-page mt-10 mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
        <span>Looking for a curated shortlist instead?</span>
        <Link href="/best" className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4">
          Browse the best lists <ArrowRight className="h-3 w-3" />
        </Link>
      </section>
    </>
  );
}
