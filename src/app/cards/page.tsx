import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Banknote, Building2, Coins, CreditCard, Globe2, ShieldCheck, Smartphone, Sparkles, Wallet } from "lucide-react";
import { cards } from "@/lib/data";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { attributePages } from "@/lib/taxonomy";

export const metadata: Metadata = buildMetadata({
  title: "Crypto Card Guides — No-KYC, Self-Custody, Cashback & More",
  description:
    "Browse every crypto card guide: no-KYC cards, self-custody wallets, Apple Pay, 0% FX, business cards and high cashback programmes.",
  path: "/cards",
});

const ICONS: Record<string, typeof ShieldCheck> = {
  "no-kyc": ShieldCheck,
  "self-custody": Wallet,
  "apple-pay": Smartphone,
  "google-pay": Smartphone,
  "virtual-ad-spend": CreditCard,
  business: Building2,
  "high-cashback": Banknote,
  "no-fx": Globe2,
  "virtual-cards": CreditCard,
  "physical-cards": CreditCard,
  "light-kyc": BadgeCheck,
  "zero-annual-fee": Sparkles,
  stablecoin: Coins,
};

const breadcrumbs = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Crypto card guides", path: "/cards" },
]);

export default function GuidesIndexPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <div className="container-page py-12 sm:py-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3 w-3" /> Guides
          </div>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Start with the right constraint
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Every guide below is generated from the same fee database as the directory. Pick a constraint — privacy,
            custody, mobile wallet, card form — and we filter the market down to the programmes that actually fit.
          </p>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {attributePages.map((page) => {
            const count = cards.filter(page.filter).length;
            const Icon = ICONS[page.slug] ?? Sparkles;
            return (
              <Link
                key={page.slug}
                href={`/cards/${page.slug}`}
                className="group flex flex-col rounded-xl border border-border bg-card p-4 transition hover:border-foreground/20 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {page.eyebrow}
                  </span>
                </div>
                <h2 className="mt-3 text-sm font-semibold tracking-tight text-foreground group-hover:text-muted-foreground">
                  {page.heading}
                </h2>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{page.description}</p>
                <div className="mt-auto flex items-center justify-between border-t border-border pt-2.5">
                  <span className="num text-xs font-semibold text-foreground">{count} cards</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-4">
                    Open guide <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <Link href="/countries" className="rounded-xl border border-border bg-card p-4 hover:border-foreground/20">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Geo</div>
            <div className="mt-1 text-sm font-semibold text-foreground">Browse by country</div>
            <p className="mt-1 text-xs leading-4 text-muted-foreground">See which cards publish availability in your market.</p>
          </Link>
          <Link href="/crypto" className="rounded-xl border border-border bg-card p-4 hover:border-foreground/20">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Assets</div>
            <div className="mt-1 text-sm font-semibold text-foreground">Browse by token or chain</div>
            <p className="mt-1 text-xs leading-4 text-muted-foreground">USDT, USDC, SOL, Base, Tron and more.</p>
          </Link>
          <Link href="/compare" className="rounded-xl border border-border bg-card p-4 hover:border-foreground/20">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Head-to-head</div>
            <div className="mt-1 text-sm font-semibold text-foreground">Compare two cards</div>
            <p className="mt-1 text-xs leading-4 text-muted-foreground">Metric-by-metric with a winner in every row.</p>
          </Link>
        </div>
      </div>
    </>
  );
}
