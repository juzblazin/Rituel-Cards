import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, Globe2, MapPin, ShieldCheck, Wallet } from "lucide-react";
import { cards, kycLabel } from "@/lib/data";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd, itemListJsonLd } from "@/lib/seo";
import {
  cardsForCountry,
  countryFromSlug,
  countryPageTitle,
  featuredPairs,
  supportedCountries,
} from "@/lib/taxonomy";
import { cashbackLabel, pct } from "@/lib/format";
import { Directory } from "@/components/directory/directory";
import { Badge } from "@/components/ui";

type Props = { params: Promise<{ country: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return supportedCountries.map((country) => ({ country: country.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country: slug } = await params;
  const country = countryFromSlug(slug);
  if (!country) return {};
  const available = cardsForCountry(country.code);
  if (available.length === 0) return {};
  return buildMetadata({
    title: `${countryPageTitle(country.name)} — ${available.length} Cards Compared`,
    description: `Compare ${available.length} crypto debit, credit and prepaid cards available in ${country.name}. Real FX fees, cashback, KYC levels and limits for 2026.`,
    path: `/countries/${country.slug}`,
    keywords: [
      `crypto card ${country.name}`,
      `best crypto card ${country.name}`,
      `bitcoin card ${country.name}`,
      `crypto debit card ${country.name}`,
    ],
  });
}

export default async function CountryPage({ params }: Props) {
  const { country: slug } = await params;
  const country = countryFromSlug(slug);
  if (!country) notFound();

  const available = cardsForCountry(country.code).sort((a, b) => b.ratingScore - a.ratingScore);
  if (available.length === 0) notFound();

  const top = available.slice(0, 3);
  const noKyc = available.filter((card) => card.kycLevel === "no_kyc");
  const selfCustody = available.filter((card) => card.custodyModel === "self_custody");
  const zeroFx = available.filter((card) => card.fxFeePct === 0);
  const bestCashback = [...available].sort((a, b) => b.cashbackMaxPct - a.cashbackMaxPct)[0];
  const nearby = supportedCountries
    .filter((item) => item.region === country.region && item.code !== country.code)
    .slice(0, 8);
  const relevantPairs = featuredPairs
    .filter((pair) => available.some((card) => card.slug === pair.a.slug || card.slug === pair.b.slug))
    .slice(0, 4);

  const faqs = [
    {
      q: `Which crypto card is best in ${country.name}?`,
      a: `Based on our editor score, ${top[0].name} is the highest-rated card available in ${country.name} (${top[0].ratingScore.toFixed(1)}/10). It offers ${cashbackLabel(top[0])} with ${pct(top[0].fxFeePct)} FX.${top[1] ? ` ${top.slice(1).map((card) => card.name).join(" and ")} ${top.length === 2 ? "is the" : "are the"} next strongest option${top.length === 2 ? "" : "s"}.` : ""}`,
    },
    {
      q: `Are there no-KYC crypto cards in ${country.name}?`,
      a:
        noKyc.length > 0
          ? `${noKyc.map((card) => card.name).join(", ")} ${noKyc.length === 1 ? "offers" : "offer"} a no-KYC tier in ${country.name}, typically capped at around $1,000 per month. Identity verification is still required above the cap.`
          : `We do not currently track a no-KYC card that explicitly lists ${country.name}. Light-KYC options are available, but you should expect identity verification before the card is issued.`,
    },
    {
      q: `Do crypto cards in ${country.name} charge FX fees?`,
      a:
        zeroFx.length > 0
          ? `${zeroFx.length} card${zeroFx.length === 1 ? "" : "s"} available in ${country.name} charge 0% FX, including ${zeroFx.slice(0, 3).map((card) => card.name).join(", ")}. Others charge up to ${pct(Math.max(...available.map((card) => card.fxFeePct)))}.`
          : `All cards currently available in ${country.name} charge an FX markup. The lowest is ${pct(Math.min(...available.map((card) => card.fxFeePct)))}.`,
    },
    {
      q: `Can I get a self-custody crypto card in ${country.name}?`,
      a:
        selfCustody.length > 0
          ? `Yes. ${selfCustody.map((card) => card.name).join(", ")} ${selfCustody.length === 1 ? "is" : "are"} available in ${country.name} and let you spend directly from a wallet you control.`
          : `We do not currently track a self-custody card that explicitly lists ${country.name}. Most options in this market are custodial.`,
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(`Crypto cards in ${country.name}`, available)) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Countries", path: "/countries" },
              { name: country.name, path: `/countries/${country.slug}` },
            ]),
          ),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />

      <div className="border-b border-border bg-background/60">
        <div className="container-page flex items-center gap-1.5 overflow-x-auto py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Directory</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href="/countries" className="hover:text-foreground">Countries</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="truncate font-medium text-muted-foreground">{country.name}</span>
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-border">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-page relative py-12 sm:py-16">
          <div className="grid items-start gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                <Globe2 className="h-3 w-3" /> Country directory · {country.region}
              </div>
              <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                <span className="mr-2 align-middle text-3xl" aria-hidden>{country.flag}</span>
                Best crypto cards in {country.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {available.length} card programmes are available in {country.name}, including{" "}
                {top.map((card) => card.name).join(", ")}. Compare real FX fees, cashback, KYC requirements and
                spending limits — then filter to the constraint that matters.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Stat icon={MapPin} label="Cards available" value={String(available.length)} />
                <Stat icon={ShieldCheck} label="No-KYC options" value={String(noKyc.length)} />
                <Stat icon={Wallet} label="Self-custody" value={String(selfCustody.length)} />
                <Stat icon={Globe2} label="0% FX" value={String(zeroFx.length)} accent />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <Badge>Best cashback: {bestCashback.name} · {pct(bestCashback.cashbackMaxPct)}</Badge>
                {top[0] && <Badge>Top rated: {top[0].name} · {top[0].ratingScore.toFixed(1)}/10</Badge>}
                <Badge>Updated Oct 2026</Badge>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Quick picks</h2>
              <div className="mt-2 divide-y divide-border">
                {top.map((card, index) => (
                  <Link key={card.slug} href={`/card/${card.slug}`} className="flex items-center gap-2 py-2 first:pt-0 last:pb-0">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{index + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-foreground">{card.name}</span>
                      <span className="block text-[10px] text-muted-foreground">{cashbackLabel(card)} · {kycLabel[card.kycLevel]}</span>
                    </span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                  </Link>
                ))}
              </div>
              <div className="mt-3 border-t border-border pt-3">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Neighbouring markets</h3>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {nearby.map((item) => (
                    <Link
                      key={item.code}
                      href={`/countries/${item.slug}`}
                      className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                    >
                      {item.flag} {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="pt-8">
        <Directory
          allCards={cards}
          initialFilters={{ country: country.code }}
          fixedCountry={country.code}
          geoCountry={country.code}
          showCountryFilter={false}
          syncUrl
          heading={`Crypto cards available in ${country.name}`}
          subheading="Every row is filtered to this country. Switch to table view for fee-level analysis."
          source={`country-${country.code.toLowerCase()}`}
          id="country-directory"
        />
      </div>

      <section className="container-page mt-12">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              How to choose a crypto card in {country.name}
            </h2>
            <div className="mt-2 space-y-2.5 text-sm leading-5 text-muted-foreground">
              <p>
                Start with availability, not cashback. A 5% headline rate is irrelevant if the issuer does not
                accept residents of {country.name}. Every card in the directory above publishes availability for
                this market.
              </p>
              <p>
                Next, decide whether you need self-custody. {selfCustody.length > 0 ? `${selfCustody.length} card${selfCustody.length === 1 ? "" : "s"} in this market are non-custodial, including ${selfCustody.slice(0, 2).map((card) => card.name).join(" and ")}.` : "None of the cards currently available here are self-custody."}{" "}
                Custodial cards are easier to use but introduce issuer risk.
              </p>
              <p>
                Finally, model the real cost. The{" "}
                <Link href="/#calculator" className="font-medium text-foreground underline underline-offset-4">
                  net return calculator
                </Link>{" "}
                subtracts top-up and FX fees before ranking cards for your spend level. A card with 3% cashback and
                a 1.5% top-up fee is worth less than it looks.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["no-kyc", "self-custody", "high-cashback", "no-fx", "apple-pay", "business"].map((attribute) => (
                <Link
                  key={attribute}
                  href={`/cards/${attribute}`}
                  className="rounded-full border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                >
                  {attribute.replace(/-/g, " ")}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">{country.name} — FAQ</h2>
            <div className="mt-1 divide-y divide-border">
              {faqs.map((faq) => (
                <details key={faq.q} className="group py-2.5">
                  <summary className="flex cursor-pointer items-center justify-between gap-2 text-xs font-semibold text-foreground">
                    {faq.q}
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-1 pr-4 text-xs leading-4 text-muted-foreground">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {relevantPairs.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Compare cards available in {country.name}
            </h2>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {relevantPairs.map((pair) => (
                <Link
                  key={pair.slug}
                  href={`/compare/${pair.slug}`}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                >
                  {pair.a.name} vs {pair.b.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
          <span>
            Showing {available.length} of {cards.length} tracked programmes. Availability sourced from issuer
            documentation, reviewed October 2026.
          </span>
          <div className="flex gap-3">
            <Link href="/countries" className="font-medium text-foreground underline underline-offset-4">All countries</Link>
            <Link href="/methodology" className="hover:text-foreground">Methodology</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Globe2;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-2.5 shadow-sm">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={accent ? "num mt-0.5 text-xl font-medium text-foreground underline underline-offset-4" : "num mt-0.5 text-xl font-semibold text-foreground"}>
        {value}
      </div>
    </div>
  );
}
