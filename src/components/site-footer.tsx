import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import { cards } from "@/lib/data";
import { featuredPairs } from "@/lib/taxonomy";
import { Wordmark } from "./ui";
import { NewsletterForm } from "./newsletter-form";

const guides = [
  ["No-KYC cards", "/cards/no-kyc"],
  ["Self-custody cards", "/cards/self-custody"],
  ["High cashback", "/cards/high-cashback"],
  ["Stablecoin cards", "/cards/stablecoin"],
  ["Zero FX fees", "/cards/no-fx"],
  ["Apple Pay cards", "/cards/apple-pay"],
  ["Cards for ad spend", "/cards/virtual-ad-spend"],
];

const countries = [
  ["United States", "/countries/united-states"],
  ["United Kingdom", "/countries/united-kingdom"],
  ["Germany", "/countries/germany"],
  ["Canada", "/countries/canada"],
  ["Australia", "/countries/australia"],
  ["Singapore", "/countries/singapore"],
  ["United Arab Emirates", "/countries/united-arab-emirates"],
  ["Brazil", "/countries/brazil"],
];

const chains = [
  ["Ethereum cards", "/crypto/ethereum"],
  ["Solana cards", "/crypto/solana"],
  ["Base cards", "/crypto/base"],
  ["Arbitrum cards", "/crypto/arbitrum"],
  ["Tron cards", "/crypto/tron"],
  ["Bitcoin cards", "/crypto/bitcoin"],
];

/** Footer comparisons are labelled by brand, not brand + card variant. */
function pairLabel(pair: { a: { name: string }; b: { name: string } }): string {
  const brand = (name: string) => {
    const trimmed = name.split(" - ")[0].replace(/\s+(?:credit\s+)?card$/i, "").trim();
    return trimmed || name;
  };
  const a = brand(pair.a.name);
  const b = brand(pair.b.name);
  return a === b ? `${pair.a.name} vs ${pair.b.name}` : `${a} vs ${b}`;
}

const stats = [
  [`${cards.length}`, "cards tracked"],
  ["250", "countries searchable"],
  ["12", "fees per card"],
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container-page py-16">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-3 text-2xl font-bold tracking-tight">Stay ahead of the fee changes</h2>
          <p className="mb-6 text-muted-foreground">
            One short email a month: new cards, reward changes and the fine print worth knowing.
          </p>
          <NewsletterForm />
        </div>

        <div className="grid gap-10 border-t pt-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Independent crypto card comparison. We track the fees, limits and country availability that
              marketing pages tend to bury.
            </p>
            <dl className="mt-6 flex gap-7">
              {stats.map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="text-lg font-semibold tracking-tight text-foreground">{value}</dd>
                  <dd className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/submit-card"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition hover:bg-primary/85"
              >
                List your card <ArrowUpRight className="size-3.5" />
              </Link>
              <Link
                href="/methodology"
                className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-xs font-medium text-foreground transition hover:bg-muted"
              >
                Our methodology
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <FooterColumn title="Guides" links={guides} />
            <FooterColumn title="Countries" links={countries} />
            <FooterColumn title="Chains" links={chains} />
            <FooterColumn
              title="Compare"
              links={featuredPairs.slice(0, 6).map((pair) => [
                pairLabel(pair),
                `/compare/${pair.slug}`,
              ])}
            />
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Popular card comparisons
          </h2>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {featuredPairs.slice(6, 18).map((pair) => (
              <li key={pair.slug}>
                <Link
                  href={`/compare/${pair.slug}`}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {pairLabel(pair)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t pt-8 text-[11px] leading-5 text-muted-foreground md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-2">
            <p>
              <strong className="font-semibold text-foreground">Affiliate disclosure:</strong> we may earn a
              commission when you open a card through our links. This never changes the ranking inputs — fees
              and limits are normalised before sponsored placement is applied.
            </p>
            <p>
              Card data is illustrative seed data for this build and can change without notice. Always verify
              fees, limits and eligibility with the issuer before applying. Crypto card rewards may be taxable
              in your jurisdiction.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-x-4 gap-y-2">
            <Link href="/blog" className="transition hover:text-foreground">Blog</Link>
            <Link href="/methodology" className="transition hover:text-foreground">Methodology</Link>
            <Link href="/privacy" className="transition hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="transition hover:text-foreground">Terms</Link>
            <a href={`mailto:${site.email}`} className="transition hover:text-foreground">{site.email}</a>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t pt-6 text-[11px] text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span>
          <span className="font-mono text-[10px] uppercase tracking-wider">Data reviewed Oct 2026</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</h2>
      <ul className="mt-3 space-y-2.5">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link
              href={href}
              className="text-sm leading-5 text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
