import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Database, RefreshCw, Scale, ShieldCheck } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { cards } from "@/lib/data";
import { supportedCountries } from "@/lib/taxonomy";
import { Badge } from "@/components/ui";

export const metadata: Metadata = buildMetadata({
  title: "Methodology — How RItuel Scores Crypto Cards",
  description:
    "How we score crypto cards: fee weighting, data sources, verification, sponsorship policy and correction process.",
  path: "/methodology",
});

export default function MethodologyPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          <Scale className="h-3 w-3" /> Methodology
        </div>
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
          How we score a crypto card
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          RItuel exists because crypto card marketing pages are unusually good at hiding the number that matters.
          This page documents exactly how we collect, normalise and weight that number — and where sponsorship sits
          in the process.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge>{cards.length} cards tracked</Badge>
          <Badge>{supportedCountries.length} country pages</Badge>
          <Badge>Reviewed October 2026</Badge>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Section icon={BarChart3} title="The score (out of 10)">
            <p>
              The editor score is a weighted composite. It is not a user rating and it is not for sale. We publish
              the weights so you can disagree with them intelligently.
            </p>
            <div className="mt-3 space-y-2">
              {[
                ["Fees & FX", 35, "Annual, issuance, top-up, FX and ATM costs, normalised to basis points."],
                ["Rewards", 25, "Cashback rate, payout token, caps, staking requirements and realism of the top tier."],
                ["Transparency", 20, "Whether fees, limits and country availability are published clearly and updated."],
                ["Access", 15, "Country coverage, KYC friction, mobile wallet support and card form."],
                ["Sentiment", 5, "A capped adjustment from user reviews and support quality signals."],
              ].map(([label, weight, note]) => (
                <div key={String(label)} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                    <span className="num text-xs font-medium text-foreground">{weight}%</span>
                  </div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${weight}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs leading-4 text-muted-foreground">{note}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Database} title="Where the data comes from">
            <p>
              Every field starts from a primary source: the issuer&apos;s own fee schedule, card terms, country
              availability page or app onboarding flow. Secondary sources are used only to find the primary document.
              If a fee is not published, we mark it as unknown rather than infer a value.
            </p>
            <p>
              All monetary values are normalised to USD for comparison. Percentage fees are stored as decimals to
              two places. Country availability is stored as ISO-3166 alpha-2 codes, which is what powers the geo
              directory.
            </p>
            <div className="mt-3 rounded-lg border border-warning/25 bg-warning/10 p-3 text-xs leading-4 text-warning-foreground">
              <strong className="font-semibold">Build note:</strong> the dataset in this repository is illustrative
              seed data for the product build. It is realistic but not a live feed. Production launch requires a
              verified data pipeline and a legal review of every claim.
            </div>
          </Section>

          <Section icon={RefreshCw} title="Update cadence">
            <p>
              Listings are re-checked quarterly, and immediately when an issuer notifies us of a change. Sponsored
              partners can update fees at any time, but changes still go through the same review. A verified listing
              loses its badge if the published fee schedule is more than six months old.
            </p>
          </Section>

          <Section icon={ShieldCheck} title="Sponsorship policy">
            <p>
              Sponsored cards are pinned above organic results, labelled “Sponsored”, and given a neutral highlight. They are excluded from any filter they do not meet. Sponsorship never changes a fee value, a
              calculator input or the editor score.
            </p>
            <p>
              Affiliate links are cloaked through <code className="rounded bg-muted px-1 text-xs">/go/[slug]</code>{" "}
              and tagged with UTM parameters. Commission does not influence ranking, but it does fund the data work.
            </p>
          </Section>

          <Section icon={RefreshCw} title="Corrections">
            <p>
              Found a fee that is wrong or a country that is missing?{" "}
              <Link href="/submit-card" className="font-medium text-foreground underline underline-offset-4">
                Submit a correction
              </Link>{" "}
              or email the address in the footer. We aim to respond within two business days and will publish the
              correction date on the listing.
            </p>
          </Section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">What we do not do</h2>
            <ul className="mt-2 space-y-2 text-xs leading-4 text-muted-foreground">
              {[
                "Sell a higher editor score.",
                "Rank a card in a category it does not qualify for.",
                "Assume an unpublished fee is zero.",
                "Treat a card as available in a country without a primary source.",
                "Use user reviews as a substitute for fee data.",
              ].map((item) => (
                <li key={item} className="flex gap-1.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-destructive" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-primary p-5 text-primary-foreground">
            <h2 className="text-sm font-semibold">Transparent by default</h2>
            <p className="mt-1.5 text-xs leading-5 text-primary-foreground/60">
              Every comparison page shows the raw numbers beside the “Best” badge. If our verdict disagrees with the
              table, trust the table.
            </p>
            <Link
              href="/compare"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Compare cards <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">Legal</h2>
            <div className="mt-2 flex flex-col gap-1.5 text-xs">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy policy</Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of use</Link>
              <Link href="/submit-card" className="text-muted-foreground hover:text-foreground">List a card</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof BarChart3;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-foreground">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      <div className="mt-2 space-y-2 text-sm leading-5 text-muted-foreground">{children}</div>
    </section>
  );
}
