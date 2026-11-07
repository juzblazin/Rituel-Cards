import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight, CreditCard, ShoppingCart, Smartphone } from "lucide-react";
import { cards } from "@/lib/data";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { useCasePages } from "@/lib/taxonomy";
import { useCasePath } from "@/lib/paths";

export const metadata: Metadata = buildMetadata({
  title: "Crypto Cards by Use Case — Apple Pay, Google Pay & Ad Spend",
  description:
    "Crypto cards filtered by how you actually spend: Apple Pay and Google Pay support, virtual cards for ad platforms and merchant rails.",
  path: "/use-cases",
  keywords: ["crypto card apple pay", "crypto card google pay", "crypto card ad spend", "virtual crypto card"],
});

const ICONS: Record<string, typeof Smartphone> = {
  "apple-pay": Smartphone,
  "google-pay": Smartphone,
  "virtual-ad-spend": CreditCard,
};

const breadcrumbs = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Use cases", path: "/use-cases" },
]);

export default function UseCasesIndexPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <div className="border-b border-border bg-background/60">
        <div className="container-page flex items-center gap-1.5 py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Crypto Card</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="font-medium text-muted-foreground">Use cases</span>
        </div>
      </div>

      <div className="container-page py-12 sm:py-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShoppingCart className="h-3 w-3" /> Use cases · {useCasePages.length} guides
          </div>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Cards for the way you spend
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Merchant and payment rails are where crypto cards live or die. These guides track which programmes
            actually work with the wallets and platforms you use.
          </p>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {useCasePages.map((page) => {
            const count = cards.filter(page.filter).length;
            const Icon = ICONS[page.slug] ?? CreditCard;
            return (
              <Link
                key={page.slug}
                href={useCasePath(page.slug)}
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
      </div>
    </>
  );
}
