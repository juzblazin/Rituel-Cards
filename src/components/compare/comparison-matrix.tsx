import Link from "next/link";
import { Fragment } from "react";
import { ArrowUpRight, Check, X } from "lucide-react";
import type { Card, MobileWallet } from "@/lib/data";
import { custodyLabel, kycLabel, networkLabel, walletOptions } from "@/lib/data";
import { cashbackLabel, feeLabel, money, pct } from "@/lib/format";
import { cn } from "@/lib/cn";
import { AffiliateLink } from "@/components/affiliate-link";
import { Badge, CardArt, Rating } from "@/components/ui";

type Metric = {
  label: string;
  group: string;
  value: (card: Card) => number | string | null;
  render?: (card: Card) => React.ReactNode;
  best?: "min" | "max";
  hint?: string;
};

const metrics: Metric[] = [
  {
    group: "Verdict",
    label: "Editor score",
    value: (c) => c.ratingScore,
    best: "max",
    render: (c) => <Rating score={c.ratingScore} />,
    hint: "Composite of fees, rewards, transparency and user sentiment",
  },
  {
    group: "Costs",
    label: "Annual fee",
    value: (c) => c.annualFeeUsd,
    best: "min",
    render: (c) => <span className="num">{feeLabel(c.annualFeeUsd, "None")}</span>,
  },
  {
    group: "Costs",
    label: "FX fee",
    value: (c) => c.fxFeePct,
    best: "min",
    render: (c) => (
      <span className={cn("num", c.fxFeePct === 0 && "font-medium text-success")}>{pct(c.fxFeePct)}</span>
    ),
  },
  {
    group: "Costs",
    label: "Crypto top-up",
    value: (c) => c.topupFeePct,
    best: "min",
    render: (c) => <span className="num">{pct(c.topupFeePct)}</span>,
  },
  {
    group: "Costs",
    label: "Issuance fee",
    value: (c) => c.issuanceFeeUsd,
    best: "min",
    render: (c) => <span className="num">{feeLabel(c.issuanceFeeUsd)}</span>,
  },
  {
    group: "Costs",
    label: "ATM fee",
    value: (c) => c.atmFeePct,
    best: "min",
    render: (c) => <span className="num">{pct(c.atmFeePct)}</span>,
  },
  {
    group: "Rewards",
    label: "Max cashback",
    value: (c) => c.cashbackMaxPct,
    best: "max",
    render: (c) => <span className="font-medium text-success">{cashbackLabel(c)}</span>,
  },
  {
    group: "Rewards",
    label: "Payout token",
    value: (c) => c.payoutToken,
    render: (c) => <span className="font-mono text-xs">{c.payoutToken}</span>,
  },
  {
    group: "Rewards",
    label: "Staking",
    value: (c) => c.stakingRequirement,
    render: (c) => <span className="text-xs">{c.stakingRequirement}</span>,
  },
  {
    group: "Rewards",
    label: "Perks",
    value: () => null,
    render: (c) => <span className="text-xs leading-4">{c.perks.slice(0, 3).join(" · ") || "—"}</span>,
  },
  {
    group: "Access",
    label: "KYC",
    value: (c) => (c.kycLevel === "no_kyc" ? 3 : c.kycLevel === "light_kyc" ? 2 : 1),
    best: "max",
    render: (c) => <Badge tone={c.kycLevel === "no_kyc" ? "emerald" : "neutral"}>{kycLabel[c.kycLevel]}</Badge>,
    hint: "No KYC scored highest, then light KYC",
  },
  {
    group: "Access",
    label: "Custody",
    value: () => null,
    render: (c) => <Badge tone={c.custodyModel === "self_custody" ? "dark" : "neutral"}>{custodyLabel[c.custodyModel]}</Badge>,
  },
  {
    group: "Access",
    label: "Countries",
    value: (c) => c.supportedCountries.length,
    best: "max",
    render: (c) => (
      <span className="text-xs">
        <span className="num font-medium">{c.supportedCountries.length}</span>{" "}
        <span className="text-muted-foreground">({c.regionLabel})</span>
      </span>
    ),
  },
  {
    group: "Access",
    label: "Max daily spend",
    value: (c) => c.maxDailySpendUsd,
    best: "max",
    render: (c) => <span className="num">{money(c.maxDailySpendUsd)}</span>,
  },
  {
    group: "Access",
    label: "Monthly ATM limit",
    value: (c) => c.monthlyAtmLimitUsd,
    best: "max",
    render: (c) => <span className="num">{c.monthlyAtmLimitUsd === 0 ? "No ATM" : money(c.monthlyAtmLimitUsd)}</span>,
  },
  {
    group: "Access",
    label: "Mobile wallets",
    value: (c) => c.mobileWallets.length,
    best: "max",
    render: (c) => (
      <span className="flex flex-wrap gap-1">
        {walletOptions
          .filter((w) => c.mobileWallets.includes(w.value as MobileWallet))
          .map((w) => (
            <span key={w.value} className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Check className="h-2.5 w-2.5 text-success" /> {w.label.replace(" Pay", "")}
            </span>
          ))}
      </span>
    ),
  },
  {
    group: "Access",
    label: "Networks",
    value: (c) => c.supportedChains.length,
    best: "max",
    render: (c) => (
      <span className="text-xs leading-4 text-muted-foreground">{c.supportedChains.slice(0, 4).join(", ")}
        {c.supportedChains.length > 4 ? ` +${c.supportedChains.length - 4}` : ""}
      </span>
    ),
  },
  {
    group: "Access",
    label: "Issuer",
    value: (c) => c.issuerName,
    render: (c) => <span className="text-xs">{c.issuerName}</span>,
  },
  {
    group: "Access",
    label: "Network",
    value: (c) => networkLabel[c.network],
    render: (c) => <span className="text-xs">{networkLabel[c.network]}</span>,
  },
];

function bestSet(metric: Metric, cards: Card[]): Set<number> {
  const result = new Set<number>();
  if (!metric.best) return result;
  const values = cards.map((card) => metric.value(card));
  if (values.some((value) => value === null)) return result;
  const numeric = values as number[];
  if (numeric.every((value) => value === numeric[0])) return result;
  const target = metric.best === "min" ? Math.min(...numeric) : Math.max(...numeric);
  numeric.forEach((value, index) => {
    if (value === target) result.add(index);
  });
  return result;
}

export function ComparisonMatrix({ cards }: { cards: Card[] }) {
  const groups = Array.from(new Set(metrics.map((metric) => metric.group)));

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[800px] border-collapse text-left">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 w-[160px] border-b border-border bg-card p-4 align-bottom">
              <span className="text-xs font-medium text-muted-foreground">Metric</span>
            </th>
            {cards.map((card) => (
              <th key={card.slug} className="min-w-[240px] border-b border-l border-border p-4 align-top">
                <div className="relative inline-block">
                  <CardArt card={card} className="h-[216px] w-[337.5px]" />
                  {card.isSponsored && (
                    <Badge className="absolute right-2 top-2">Sponsored</Badge>
                  )}
                </div>
                <Link href={`/card/${card.slug}`} className="mt-3 block text-base font-semibold leading-5 text-foreground hover:text-foreground">
                  {card.name}
                </Link>
                <div className="mt-1 text-xs text-muted-foreground">{card.issuerName}</div>
                <div className="mt-2">
                  <Rating score={card.ratingScore} />
                </div>
                <AffiliateLink
                  slug={card.slug}
                  cardName={card.name}
                  source="compare-matrix"
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
                >
                  Get card <ArrowUpRight className="h-4 w-4" />
                </AffiliateLink>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group}>
              <tr>
                <td
                  colSpan={cards.length + 1}
                  className="sticky left-0 border-b border-border bg-muted/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {group}
                </td>
              </tr>
              {metrics
                .filter((metric) => metric.group === group)
                .map((metric) => {
                  const winners = bestSet(metric, cards);
                  return (
                    <tr key={metric.label} className="border-b border-border/80">
                      <th scope="row" className="sticky left-0 z-10 border-r border-border bg-card px-4 py-3.5 align-top">
                        <span className="text-xs font-medium text-muted-foreground">{metric.label}</span>
                        {metric.hint && <span className="mt-0.5 block text-[10px] leading-3 text-muted-foreground">{metric.hint}</span>}
                      </th>
                      {cards.map((card, index) => {
                        const isWinner = winners.has(index);
                        return (
                          <td
                            key={card.slug}
                            className={cn(
                              "border-l border-border/70 px-4 py-3.5 align-top text-sm",
                              isWinner && "bg-muted/40",
                            )}
                          >
                            <div className="flex items-start gap-2">
                              {isWinner && (
                                <span className="mt-0.5 rounded bg-success px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success-foreground">
                                  Best
                                </span>
                              )}
                              <div className={cn(isWinner && "font-medium text-foreground")}>
                                {metric.render ? metric.render(card) : String(metric.value(card) ?? "—")}
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function WinnerSummary({ cards }: { cards: Card[] }) {
  const bestRating = [...cards].sort((a, b) => b.ratingScore - a.ratingScore)[0];
  const bestCashback = [...cards].sort((a, b) => b.cashbackMaxPct - a.cashbackMaxPct)[0];
  const cheapestFx = [...cards].sort((a, b) => a.fxFeePct - b.fxFeePct)[0];
  const cheapestAnnual = [...cards].sort((a, b) => a.annualFeeUsd - b.annualFeeUsd)[0];

  const items = [
    { label: "Highest editor score", card: bestRating, value: `${bestRating.ratingScore.toFixed(1)}/10` },
    { label: "Highest cashback", card: bestCashback, value: cashbackLabel(bestCashback) },
    { label: "Lowest FX fee", card: cheapestFx, value: pct(cheapestFx.fxFeePct) },
    { label: "Lowest annual fee", card: cheapestAnnual, value: feeLabel(cheapestAnnual.annualFeeUsd, "None") },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-border bg-card p-3">
          <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">{item.label}</div>
          <div className="mt-1 truncate text-xs font-medium text-foreground">{item.card.name}</div>
          <div className="num mt-0.5 text-xs font-medium text-success">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

export function RemoveCardButton({ onClick, name }: { onClick: () => void; name: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
      aria-label={`Remove ${name} from comparison`}
    >
      <X className="h-3.5 w-3.5" />
    </button>
  );
}
