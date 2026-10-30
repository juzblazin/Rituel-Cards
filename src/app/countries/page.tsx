import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { supportedCountries, cardsForCountry } from "@/lib/taxonomy";

export const metadata: Metadata = buildMetadata({
  title: "Crypto Cards by Country — 2026 Availability Directory",
  description:
    "Find crypto debit and credit cards available in your country. Browse 250 countries and compare fees, KYC and cashback.",
  path: "/countries",
});

const breadcrumbs = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Crypto cards by country", path: "/countries" },
]);

export default function CountriesIndexPage() {
  const regions = new Map<string, typeof supportedCountries>();
  for (const country of supportedCountries) {
    const list = regions.get(country.region) ?? [];
    list.push(country);
    regions.set(country.region, list);
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <div className="container-page py-12 sm:py-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Globe2 className="h-3 w-3" /> Geo directory
          </div>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Crypto cards by country
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Availability is the first filter that matters. These pages are generated from each issuer&apos;s
            published country list — {supportedCountries.length} countries currently have at least one card in the
            directory.
          </p>
        </div>

        <div className="mt-8 space-y-8">
          {[...regions.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([region, list]) => (
              <section key={region}>
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{region}</h2>
                  <span className="text-xs text-muted-foreground">{list.length} countries</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {list
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((country) => {
                      const count = cardsForCountry(country.code).length;
                      return (
                        <Link
                          key={country.code}
                          href={`/countries/${country.slug}`}
                          className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm transition hover:bg-muted"
                        >
                          <span className="text-base" aria-hidden>{country.flag}</span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{country.name}</span>
                          <span className="num rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{count}</span>
                          <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                        </Link>
                      );
                    })}
                </div>
              </section>
            ))}
        </div>

        <div className="mt-10 rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Don&apos;t see your country?</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
            Some cards operate regionally without publishing a full country list. Start with the{" "}
            <Link href="/cards" className="font-medium text-foreground underline underline-offset-4">guide directory</Link>{" "}
            or{" "}
            <Link href="/submit-card" className="font-medium text-foreground underline underline-offset-4">submit a card</Link>{" "}
            that should be listed here.
          </p>
        </div>
      </div>
    </>
  );
}
