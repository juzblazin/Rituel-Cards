import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BarChart3, CalendarCheck, FileCheck2, Globe2, Mail, Megaphone, ShieldCheck } from "lucide-react";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import { SubmitCardForm } from "@/components/submit/submit-card-form";
import ReflectiveCard from "@/components/react-bits/reflective-card";
import { Badge } from "@/components/ui";

export const metadata: Metadata = buildMetadata({
  title: "Submit or List Your Crypto Card — Verified & Sponsored Placement",
  description:
    "List your crypto debit or credit card on RItuel. Free standard listing, $299 Verified Fast-Track and $999/mo Sponsored Partner placements.",
  path: "/submit-card",
  keywords: ["submit crypto card", "list crypto card", "crypto card directory", "crypto card advertising"],
});

const FAQS = [
  {
    q: "Do you accept every submission?",
    a: "No. We only list cards with a working public website and a published fee schedule. We reject cards that cannot evidence licensing, cards with undisclosed fees and listings that appear to be affiliate-only resellers rather than issuers or programme managers.",
  },
  {
    q: "What does the Verified badge mean?",
    a: "Verified means we have checked the issuer's legal entity, reviewed the published fee schedule within the last six months, and confirmed at least three country availabilities from a primary source. It is not an endorsement of the product.",
  },
  {
    q: "Can sponsorship change our ranking?",
    a: "Sponsored cards are pinned above organic results and labelled. They are never given a better editor score, and they are removed from a filtered result if they do not meet the filter criteria. Fee values and calculator maths are unaffected.",
  },
  {
    q: "How does billing work?",
    a: "Verified Fast-Track is a one-time $299 fee after data review. Sponsored Partner is $999 per month with a 30-day rolling term. We support Stripe card payments and USDC invoices on Ethereum, Base or Arbitrum.",
  },
  {
    q: "How fast is publishing?",
    a: "Standard listings are reviewed within five to seven business days. Verified Fast-Track is published within 48 hours of a complete submission, including a fee table, country list and card artwork.",
  },
];

export default function SubmitCardPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }} />

      <section className="relative overflow-hidden border-b border-border">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-page relative py-12">
          <div className="grid items-center gap-10 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div>
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Megaphone className="h-3 w-3" /> For issuers & marketing teams
                </div>
                <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                  Put your card in front of
                  <br />
                  <span className="bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">people already comparing.</span>
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  RItuel readers are not browsing for news — they are choosing a card. Get a data-accurate profile,
                  country-level distribution and qualified outbound clicks. No display-network noise.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge>130+ indexable pages</Badge>
                  <Badge>Country-level availability</Badge>
                  <Badge>Affiliate click reporting</Badge>
                  <Badge>Manual data review</Badge>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ["24", "cards benchmarked"],
                  ["90+", "country pages"],
                  ["12%", "target outbound CTR"],
                  ["48h", "fast-track review"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-border bg-card p-3 shadow-sm">
                    <div className="text-xl font-semibold tracking-tight text-foreground">{value}</div>
                    <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-auto mt-2 w-full max-w-[300px] xl:mt-0" aria-hidden="true">
              <ReflectiveCard
                theme="dark"
                width="100%"
                height={400}
                radius={22}
                badge="Verified partner"
                name="Your card"
                role="Fast-Track listing"
                status="48h review"
                idLabel="Placement"
                idValue="Sponsored partner"
                metalness={0.95}
                roughness={0.32}
                blurStrength={8}
                shine={0.9}
                glare={0.45}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-10">
        <div className="max-w-2xl">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Plans</div>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Transparent placement pricing</h2>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Every plan includes the same normalised fee profile. Paid plans buy distribution and review speed, not
            a better score.
          </p>
        </div>

        <div className="mt-5">
          <SubmitCardForm />
        </div>

        <section className="mt-14">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Process</div>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">From submission to clicks</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: FileCheck2, title: "Submit the data", body: "Fee schedule, supported countries, KYC tiers and card artwork. A CSV is fine." },
              { icon: ShieldCheck, title: "We verify", body: "Legal entity, fee notes and country list are checked against primary sources." },
              { icon: CalendarCheck, title: "Profile goes live", body: "Your card appears in the directory, relevant guides and country pages." },
              { icon: BarChart3, title: "Track outbound clicks", body: "Sponsored partners get monthly click and placement reporting." },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">0{index + 1}</span>
                  </div>
                  <h3 className="mt-2.5 text-sm font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-xs leading-4 text-muted-foreground">{step.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">FAQ</div>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Before you submit</h2>
            <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {FAQS.map((faq) => (
                <details key={faq.q} className="group px-4 py-3.5">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-foreground">
                    {faq.q}
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 pr-6 text-xs leading-5 text-muted-foreground">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-primary p-5 text-primary-foreground">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-foreground/10">
                  <BadgeCheck className="h-4 w-4 text-success" />
                </span>
                <h2 className="text-sm font-semibold">Need a custom placement?</h2>
              </div>
              <p className="mt-2 text-xs leading-5 text-primary-foreground/60">
                Category exclusivity, newsletter sponsorship and custom country takeovers are available for
                established issuers. Tell us what you need in the submission form.
              </p>
              <a
                href={`mailto:${site.email}?subject=Custom%20placement%20on%20RItuel`}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <Mail className="h-3.5 w-3.5" /> {site.email}
              </a>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground">What we need</h2>
              <ul className="mt-2 space-y-1.5 text-xs leading-4 text-muted-foreground">
                {[
                  "Legal entity and issuing bank",
                  "Full fee schedule (issuance, annual, top-up, FX, ATM)",
                  "Supported countries (ISO codes or a list)",
                  "KYC tiers and no-KYC limits",
                  "Card artwork in WebP or PNG",
                ].map((item) => (
                  <li key={item} className="flex gap-1.5">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-success" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Globe2 className="h-3.5 w-3.5 text-success" /> Data accuracy policy
              </div>
              <p className="mt-1 text-xs leading-4 text-muted-foreground">
                We re-check every listing quarterly. If a fee changes without notice and we find out from a user
                report, the Verified badge is suspended until the data is corrected.
              </p>
              <Link href="/methodology" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-4">
                Read methodology <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
