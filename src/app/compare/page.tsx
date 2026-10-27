import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Scale, Sparkles } from "lucide-react";
import { cards } from "@/lib/data";
import { cashbackLabel } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { featuredPairs } from "@/lib/taxonomy";
import { CardArt } from "@/components/ui";
import { ComparePicker } from "@/components/compare/compare-picker";

export const metadata: Metadata = buildMetadata({
  title: "Compare Crypto Cards Side-by-Side — Fees, Cashback & KYC",
  description:
    "Build your own crypto card comparison. Compare fees, cashback, KYC, custody and country availability across 24 cards.",
  path: "/compare",
});

export default function CompareIndexPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          <Scale className="h-3 w-3" /> Compare
        </div>
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
          Two cards. Every fee.
          <br />
          <span className="bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">One honest verdict.</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Pick any two cards for a side-by-side matrix. The lowest fee and highest reward in each row is marked,
          including the fee notes that usually hide in a PDF.
        </p>
      </div>

      <div className="mt-6 max-w-4xl">
        <ComparePicker options={cards.map((card) => ({ slug: card.slug, name: card.name }))} />
      </div>

      <div className="mt-12">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Most searched</div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Popular comparisons</h2>
          </div>
          <Link href="/" className="text-xs font-medium text-foreground underline underline-offset-4">
            Browse directory →
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPairs.map((pair) => (
            <Link
              key={pair.slug}
              href={`/compare/${pair.slug}`}
              className="group rounded-xl border border-border bg-card p-3.5 transition hover:border-foreground/20 hover:shadow-lg"
            >
              <div className="flex items-center gap-2">
                <CardArt card={pair.a} className="h-10 w-[64px]" />
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border bg-card text-[10px] font-bold uppercase text-muted-foreground">
                  vs
                </span>
                <CardArt card={pair.b} className="h-10 w-[64px]" />
                <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
              </div>
              <div className="mt-2 truncate text-sm font-semibold text-foreground">
                {pair.a.name} <span className="font-normal text-muted-foreground">vs</span> {pair.b.name}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {cashbackLabel(pair.a)} vs {cashbackLabel(pair.b)}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-start gap-3 rounded-xl border border-border bg-card p-4">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-foreground">
          <Sparkles className="h-4 w-4" />
        </span>
        <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
          Comparison pages are generated from the same normalised dataset as the directory. If a field is missing
          for an issuer we show “—” rather than infer a value. Sponsored cards are labelled but never given a
          scoring advantage.
        </p>
        <Link href="/methodology" className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-4">
          Methodology <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Examples: {featuredPairs.slice(0, 4).map((pair, index) => (
          <span key={pair.slug}>
            {index > 0 && " · "}
            <Link href={`/compare/${pair.slug}`} className="hover:text-foreground">
              {pair.a.name} vs {pair.b.name}
            </Link>
          </span>
        ))}
      </p>
    </div>
  );
}
