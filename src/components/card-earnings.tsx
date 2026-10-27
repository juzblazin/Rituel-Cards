"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Calculator } from "lucide-react";
import type { Card } from "@/lib/data";
import { estimateCard } from "@/lib/calc";
import { cn } from "@/lib/cn";
import { AffiliateLink } from "@/components/affiliate-link";

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "SGD", "BRL", "JPY"];
const TOKENS = ["USDC", "USDT", "ETH", "BTC", "SOL", "EURe"];

export function CardEarnings({ card }: { card: Card }) {
  const [spend, setSpend] = useState(2000);
  const [currency, setCurrency] = useState("USD");
  const [token, setToken] = useState("USDC");

  const result = useMemo(
    () => estimateCard(card, { spend: Math.max(0, spend), currency, token }),
    [card, spend, currency, token],
  );

  const fmt = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Calculator className="h-3.5 w-3.5" />
        </span>
        <div>
          <h2 className="text-sm font-medium text-foreground">Estimate your net return</h2>
          <p className="text-[10px] text-muted-foreground">Cashback minus top-up, FX and annual fee</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="col-span-2 block">
          <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Monthly spend</span>
          <div className="flex h-9 items-center rounded-lg border border-border bg-background px-2">
            <span className="text-xs text-muted-foreground">$</span>
            <input
              type="number"
              min={0}
              step={100}
              value={spend}
              onChange={(event) => setSpend(Number(event.target.value) || 0)}
              className="num w-full bg-transparent px-1 text-right text-sm font-medium outline-none"
              aria-label="Monthly spend"
            />
          </div>
        </label>
        <label>
          <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Currency</span>
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {CURRENCIES.map((code) => (
              <option key={code}>{code}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Token</span>
          <select
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {TOKENS.map((code) => (
              <option key={code}>{code}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 rounded-xl bg-muted p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Estimated net</div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className={cn("num text-2xl font-medium tracking-tight", result.net >= 0 ? "text-success" : "text-destructive")}>
            {result.net >= 0 ? "+" : ""}
            {fmt(result.net)}
          </span>
          <span className="text-[10px] text-muted-foreground">/ month</span>
        </div>
        <div className="mt-1 text-[10px] text-muted-foreground">
          {fmt(result.net * 12)} per year · {result.effectiveReturnPct.toFixed(2)}% effective
        </div>

        <dl className="mt-2.5 grid grid-cols-4 gap-1 border-t border-border pt-2 text-center">
          <div>
            <dt className="text-[9px] uppercase tracking-wide text-muted-foreground">Cashback</dt>
            <dd className="num text-[10px] text-success">{fmt(result.grossCashback)}</dd>
          </div>
          <div>
            <dt className="text-[9px] uppercase tracking-wide text-muted-foreground">Top-up</dt>
            <dd className="num text-[10px] text-foreground">−{fmt(result.topupCost)}</dd>
          </div>
          <div>
            <dt className="text-[9px] uppercase tracking-wide text-muted-foreground">FX</dt>
            <dd className="num text-[10px] text-foreground">−{fmt(result.fxCost)}</dd>
          </div>
          <div>
            <dt className="text-[9px] uppercase tracking-wide text-muted-foreground">Annual</dt>
            <dd className="num text-[10px] text-foreground">−{fmt(result.annualCost)}</dd>
          </div>
        </dl>
      </div>

      {result.tokenPenalty > 0 && (
        <p className="mt-2 text-[10px] leading-4 text-warning">
          {card.name} does not list {token}; we add a 0.5% conversion surcharge.
        </p>
      )}

      <AffiliateLink
        slug={card.slug}
        cardName={card.name}
        source="card-calculator"
        className="mt-3 flex h-9 w-full items-center justify-center gap-1 rounded-lg bg-primary text-xs font-medium text-primary-foreground transition hover:bg-primary/80"
      >
        Get {card.name} <ArrowUpRight className="h-3 w-3" />
      </AffiliateLink>
      <p className="mt-1.5 text-center text-[10px] leading-3 text-muted-foreground">
        At max published tier. Excludes crypto price change and tax.
      </p>
    </div>
  );
}
