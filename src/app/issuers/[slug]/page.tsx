import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, ChevronRight, Layers, ShieldCheck, ThumbsDown, ThumbsUp, XCircle } from "lucide-react";
import { cards, kycLabel, networkLabel } from "@/lib/data";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd, itemListJsonLd, routeOgImage } from "@/lib/seo";
import { cardsOnRail, infraBySlug, infraProviders } from "@/lib/infra";
import { cashbackLabel, pct, plural } from "@/lib/format";
import { Badge, BrandMark } from "@/components/ui";
import { cn } from "@/lib/cn";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return infraProviders.map((provider) => ({ slug: provider.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const provider = infraBySlug.get(slug);
  if (!provider) return {};
  const powered = cardsOnRail(provider, cards);
  const title = `Cards Powered by ${provider.name} (${powered.length})`;
  return buildMetadata({
    title,
    description: `Which crypto cards run on the ${provider.name} issuing rail: licences, pros & cons, and every card powered by ${provider.name} in 2026.`,
    path: `/issuers/${provider.slug}`,
    image: routeOgImage(`/issuers/${provider.slug}`, title),
    keywords: [
      `cards powered by ${provider.name}`,
      `${provider.name.toLowerCase()} card issuer`,
      `${provider.name.toLowerCase()} crypto card infrastructure`,
      `${provider.name.toLowerCase()} card rail`,
      `${provider.name.toLowerCase()} issuing bank`,
    ],
  });
}

export default async function InfraProviderPage({ params }: Props) {
  const { slug } = await params;
  const provider = infraBySlug.get(slug);
  if (!provider) notFound();

  const powered = cardsOnRail(provider, cards);
  const rest = infraProviders.filter((other) => other.slug !== provider.slug);

  const faqs = [
    {
      q: `What is ${provider.name}?`,
      a: `${provider.name} is the regulated entity that actually issues the card — it provides the banking licence, BIN range and settlement plumbing while the crypto brand supplies the app and funding mechanism. If your card "just works", it's ${provider.name} doing the regulated part.`,
    },
    {
      q: `If I did KYC on one ${provider.name} card, is it faster on another?`,
      a: `Often yes — the compliance record lives with the issuer, so onboarding a second card on the same rail is frequently lighter-touch than starting fresh on a different one. Approval is never guaranteed, but the prior relationship helps.`,
    },
    {
      q: `What happens if ${provider.name} loses its licence or goes down?`,
      a: `Every card on the rail is affected at once — that's the hidden concentration risk of shared infrastructure. If a rail stops operating, partner programmes usually migrate cardholders to a replacement issuer, but there can be an interruption.`,
    },
    {
      q: `Are cards on the same rail identical?`,
      a: `No. The rail supplies the licence and the plumbing; the front-end brand decides fees, limits, rewards and KYC depth. Two cards on ${provider.name} can have very different terms — compare the cards, not just the issuer.`,
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(`Cards powered by ${provider.name}`, powered)) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Card issuers", path: "/issuers" },
              { name: provider.name, path: `/issuers/${provider.slug}` },
            ]),
          ),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />

      <div className="border-b border-border bg-background/60">
        <div className="container-page flex items-center gap-1.5 overflow-x-auto py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Crypto Card</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href="/issuers" className="hover:text-foreground">Card issuers</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="truncate font-medium text-muted-foreground">{provider.name}</span>
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-border">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-page relative py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Layers className="h-3 w-3" /> Card-issuing rail · {plural(powered.length, "card")}
            </div>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              What is {provider.name}?
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{provider.description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Badge tone="emerald">
                <ShieldCheck className="mr-1 h-3 w-3" /> {provider.licenses}
              </Badge>
              <Badge>{plural(powered.length, "card")} on this rail</Badge>
            </div>

            <p className="mt-4 rounded-xl border border-border bg-card/60 px-4 py-3 text-xs leading-5 text-muted-foreground">
              <strong className="text-foreground">Same-rail KYC:</strong> if you've already completed identity
              verification on one card powered by {provider.name}, onboarding another card on the same rail is
              usually lighter — the compliance record sits with the issuer, not the app.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page mt-12">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Crypto cards powered by {provider.name}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every card in our database issued on this rail — including ones you'd never guess share the same back-end.
        </p>

        {powered.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
            No cards currently tracked on this rail in our database.
          </p>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {powered.map((card) => (
              <Link
                key={card.slug}
                href={`/crypto-card/${card.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand/40"
              >
                <BrandMark card={card} className="h-9 w-9 shrink-0 text-sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground group-hover:text-brand">
                    {card.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {cashbackLabel(card)} · FX {pct(card.fxFeePct)} · {kycLabel[card.kycLevel]}
                  </p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="container-page mt-12">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
              <ThumbsUp className="size-4 text-emerald-400" /> Pros of {provider.name}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {provider.pros.map((pro) => (
                <li key={pro} className="flex items-start gap-2.5 text-sm leading-5 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
              <ThumbsDown className="size-4 text-rose-400" /> Cons of {provider.name}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {provider.cons.map((con) => (
                <li key={con} className="flex items-start gap-2.5 text-sm leading-5 text-muted-foreground">
                  <XCircle className="mt-0.5 size-4 shrink-0 text-rose-400" />
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container-page mt-12 rounded-xl border border-border bg-card p-5 sm:p-7">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Frequently asked questions</h2>
        <dl className="mt-5 space-y-5">
          {faqs.map((faq) => (
            <div key={faq.q}>
              <dt className="text-sm font-semibold text-foreground">{faq.q}</dt>
              <dd className="mt-1.5 text-sm leading-6 text-muted-foreground">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-page mt-12 border-t border-border pt-10">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Other card-issuing rails</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {rest.map((other) => (
            <Link
              key={other.slug}
              href={`/issuers/${other.slug}`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                "text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground",
              )}
            >
              {other.name} <ArrowRight className="size-3" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
