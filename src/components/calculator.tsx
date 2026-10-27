"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Calculator, Info, Sparkles, TrendingUp } from "lucide-react";
import type { Card } from "@/lib/data";
import { rankCards, type CalcResult } from "@/lib/calc";
import { cashbackLabel } from "@/lib/format";
import { cn } from "@/lib/cn";
import { AffiliateLink } from "@/components/affiliate-link";
import { CardArt } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

const CURRENCIES = [
  { code: "USD", label: "USD — US dollar", symbol: "$" },
  { code: "EUR", label: "EUR — Euro", symbol: "€" },
  { code: "GBP", label: "GBP — British pound", symbol: "£" },
  { code: "CAD", label: "CAD — Canadian dollar", symbol: "C$" },
  { code: "AUD", label: "AUD — Australian dollar", symbol: "A$" },
  { code: "SGD", label: "SGD — Singapore dollar", symbol: "S$" },
  { code: "BRL", label: "BRL — Brazilian real", symbol: "R$" },
  { code: "JPY", label: "JPY — Japanese yen", symbol: "¥" },
];

const TOKENS = ["USDC", "USDT", "ETH", "BTC", "SOL", "EURe"];

export function NetReturnCalculator({ cards }: { cards: Card[] }) {
  const [spend, setSpend] = useState(2000);
  const [currency, setCurrency] = useState("USD");
  const [token, setToken] = useState("USDC");
  const [expanded, setExpanded] = useState(false);

  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "$";

  const results = useMemo<CalcResult[]>(
    () => rankCards(cards, { spend, currency, token }),
    [cards, spend, currency, token],
  );

  const top = results.slice(0, 3);
  const best = top[0];

  const fmt = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number.isFinite(value) ? value : 0);

  return (
    <section id="calculator" className="scroll-mt-20">
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
          <div className="relative p-6 sm:p-8 lg:p-10">
            <Badge variant="outline" className="gap-1.5">
              <Calculator /> Net return
            </Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              What does your spending actually earn?
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              We subtract the top-up spread, FX markup and annual fee before ranking cards. No headline-rate
              fantasy.
            </p>

            <div className="mt-8 space-y-5">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="spend" className="text-sm font-medium">
                    Monthly card spend
                  </label>
                  <div className="flex h-9 items-center gap-1 rounded-lg border border-input bg-background px-2.5">
                    <span className="text-sm text-muted-foreground">{symbol}</span>
                    <input
                      id="spend"
                      type="number"
                      min={100}
                      max={100000}
                      step={100}
                      value={spend}
                      onChange={(event) => setSpend(Math.max(0, Math.min(100000, Number(event.target.value) || 0)))}
                      className="num w-20 bg-transparent text-right text-sm font-medium outline-none"
                      aria-label="Monthly spend amount"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={100}
                  max={20000}
                  step={100}
                  value={Math.min(spend, 20000)}
                  onChange={(event) => setSpend(Number(event.target.value))}
                  className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-foreground"
                  aria-label="Monthly spend slider"
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>{symbol}100</span>
                  <span>{symbol}20,000</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="currency" className="mb-1.5 block text-sm font-medium">
                    Spend currency
                  </label>
                  <select
                    id="currency"
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value)}
                    className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    {CURRENCIES.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="token" className="mb-1.5 block text-sm font-medium">
                    Funding token
                  </label>
                  <select
                    id="token"
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    {TOKENS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
              aria-expanded={expanded}
            >
              <Info className="size-3.5" /> How the calculation works
            </button>
            {expanded && (
              <div className="mt-3 rounded-lg bg-muted p-3 text-xs leading-5 text-muted-foreground">
                Net = (spend × cashback %) − (spend × top-up %) − (spend × FX %) − (annual fee ÷ 12). FX is
                only applied when spending in a non-USD currency. A 0.5% conversion surcharge is added when a
                card does not support your funding token. Cashback is modelled at the card&apos;s maximum
                published tier; staking requirements are not priced in.
              </div>
            )}
          </div>

          <div className="border-t bg-muted/40 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="size-3.5 text-success" /> Top 3 for your profile
                </div>
                <h3 className="mt-1 text-sm font-medium">
                  {fmt(spend)}/mo · {currency} · funded with {token}
                </h3>
              </div>
              <Badge variant="outline">{cards.length} cards modelled</Badge>
            </div>

            <div className="mt-5 space-y-3">
              {top.map((result, index) => (
                <div
                  key={result.card.slug}
                  className={cn(
                    "relative overflow-hidden rounded-xl border bg-card p-3",
                    index === 0 && "border-foreground/25 shadow-sm",
                  )}
                >
                  {index === 0 && (
                    <Badge className="absolute right-0 top-0 rounded-none rounded-bl-lg border-0 bg-primary text-primary-foreground">
                      Best net
                    </Badge>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <CardArt card={result.card} className="h-10 w-[62px] shrink-0" />
                      <span className="absolute -left-1.5 -top-1.5 grid size-4 place-items-center rounded-full border bg-background text-[9px] font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-medium">{result.card.name}</span>
                        <span className={cn("num shrink-0 text-lg font-semibold tracking-tight", result.net >= 0 ? "text-success" : "text-destructive")}>
                          {result.net >= 0 ? "+" : ""}
                          {fmt(result.net)}
                          <span className="text-xs font-normal text-muted-foreground">/mo</span>
                        </span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
                        <span>{cashbackLabel(result.card)}</span>
                        <span>·</span>
                        <span>Top-up {result.card.topupFeePct.toFixed(1)}%</span>
                        <span>·</span>
                        <span>FX {result.card.fxFeePct.toFixed(1)}%</span>
                        {result.tokenPenalty > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-warning">token not supported (+0.5%)</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-1 border-t pt-2 text-center">
                    <Metric label="Cashback" value={fmt(result.grossCashback)} tone="text-success" />
                    <Metric label="Top-up" value={`−${fmt(result.topupCost)}`} />
                    <Metric label="FX" value={`−${fmt(result.fxCost)}`} />
                    <Metric label="Annual" value={`−${fmt(result.annualCost)}`} />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      Effective return{" "}
                      <strong className={cn("font-medium", result.net >= 0 ? "text-success" : "text-destructive")}>
                        {spend > 0 ? ((result.net / spend) * 100).toFixed(2) : "0.00"}%
                      </strong>
                    </span>
                    <AffiliateLink
                      slug={result.card.slug}
                      cardName={result.card.name}
                      source={`calculator-${index + 1}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "bg-background")}
                    >
                      Get card <ArrowUpRight />
                    </AffiliateLink>
                  </div>
                </div>
              ))}
            </div>

            {best && (
              <p className="mt-4 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
                <Sparkles className="mt-0.5 size-3.5 shrink-0 text-success" />
                At {fmt(spend)}/month you would earn about{" "}
                <strong className="font-medium text-foreground">{fmt(best.net * 12)}</strong> per year more with{" "}
                {best.card.name} than with a 0% cashback card. Excludes crypto price movement and tax.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={cn("num text-xs font-medium", tone)}>{value}</div>
    </div>
  );
}
