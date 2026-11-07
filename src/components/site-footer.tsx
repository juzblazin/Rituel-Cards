import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import { bestListPages, featuredPairs } from "@/lib/taxonomy";
import { Wordmark } from "./ui";
import { NewsletterForm } from "./newsletter-form";

const rankings = [
  ["Best No-KYC cards", "/best/no-kyc"],
  ["Best self-custody", "/best/self-custody"],
  ["Zero-FX travel cards", "/best/travel"],
  ["High cashback cards", "/best/high-cashback"],
  ["Business cards", "/best/business"],
  ["Virtual cards (ads)", "/use-cases/virtual-ad-spend"],
];

const ecosystem = [
  ["Solana cards", "/chains/solana"],
  ["Base cards", "/chains/base"],
  ["Ethereum cards", "/chains/ethereum"],
  ["USDC cards", "/tokens/usdc"],
  ["USDT cards", "/tokens/usdt"],
  ["EUR stablecoins", "/tokens/eure"],
];

const regions = [
  ["United States", "/countries/united-states"],
  ["United Kingdom", "/countries/united-kingdom"],
  ["Germany (EEA)", "/countries/germany"],
  ["Brazil", "/countries/brazil"],
  ["United Arab Emirates", "/countries/united-arab-emirates"],
  ["All countries", "/countries"],
];

const issuersAndTech = [
  ["BaaS issuers directory", "/issuers"],
  ["Rain issuing", "/issuers/rain"],
  ["Pathward", "/issuers/pathward"],
  ["Fee & cashback calculator", "/tools/net-return-calculator"],
  ["All tools", "/tools"],
  ["Upcoming waitlists", "/upcoming"],
];

const company = [
  ["About & methodology", "/methodology"],
  ["Submit a card", "/submit-card"],
  ["Affiliate disclosure", "/terms"],
  ["Privacy policy", "/privacy"],
  ["Terms of service", "/terms"],
  ["XML sitemap", "/sitemap.xml"],
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

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 border-t pt-12 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-full max-w-sm lg:col-span-1">
            <Wordmark />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Independent crypto card comparison. We track the fees, limits and country availability that
              marketing pages tend to bury.
            </p>
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

          <FooterColumn title="Rankings" links={rankings} />
          <FooterColumn title="Ecosystem" links={ecosystem} />
          <FooterColumn title="Regional hubs" links={regions} />
          <FooterColumn title="Issuers & tech" links={issuersAndTech} />
          <FooterColumn title="Company & legal" links={company} />
        </div>

        <div className="mt-12 border-t pt-8">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Popular card comparisons
          </h2>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {featuredPairs.map((pair) => (
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

        <div className="mt-8 border-t pt-8">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Best of crypto cards
          </h2>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {bestListPages.slice(0, 11).map((page) => (
              <li key={page.slug}>
                <Link
                  href={`/best/${page.slug}`}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {page.heading}
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
          <li key={label}>
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
