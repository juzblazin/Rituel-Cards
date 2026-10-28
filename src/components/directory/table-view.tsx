"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ChevronDown, ChevronRight, Download, ExternalLink, Sparkles } from "lucide-react";
import type { Card } from "@/lib/data";
import { audienceLabel, custodyLabel, kycLabel, networkLabel } from "@/lib/data";
import { cashbackLabel, downloadCsv, feeLabel, money, pct } from "@/lib/format";
import { cn } from "@/lib/cn";
import { AffiliateLink } from "@/components/affiliate-link";
import { Badge, CardArt } from "@/components/ui";

type Preset = "overview" | "fees" | "rewards" | "limits";

const PRESETS: { key: Preset; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "fees", label: "Fees & FX" },
  { key: "rewards", label: "Rewards & perks" },
  { key: "limits", label: "Limits & KYC" },
];

type Column = {
  key: string;
  label: string;
  align?: "left" | "right";
  width?: string;
  sortValue?: (card: Card) => number | string;
  csv: (card: Card) => string | number;
  render: (card: Card) => React.ReactNode;
};

const columns: Record<Preset, Column[]> = {
  overview: [
    {
      key: "region",
      label: "Region / countries",
      sortValue: (c) => c.supportedCountries.length,
      csv: (c) => c.regionLabel,
      render: (c) => <span className="whitespace-nowrap text-xs text-muted-foreground">{c.regionLabel}</span>,
    },
    {
      key: "cashback",
      label: "Cashback",
      sortValue: (c) => c.cashbackMaxPct,
      csv: (c) => c.cashbackMaxPct,
      render: (c) => (
        <span className="whitespace-nowrap text-xs font-semibold text-success">{cashbackLabel(c)}</span>
      ),
    },
    {
      key: "annual",
      label: "Annual fee",
      align: "right",
      sortValue: (c) => c.annualFeeUsd,
      csv: (c) => c.annualFeeUsd,
      render: (c) => <span className="num whitespace-nowrap text-xs">{feeLabel(c.annualFeeUsd, "None")}</span>,
    },
    {
      key: "fx",
      label: "FX fee",
      align: "right",
      sortValue: (c) => c.fxFeePct,
      csv: (c) => c.fxFeePct,
      render: (c) => (
        <span className={cn("num whitespace-nowrap text-xs", c.fxFeePct === 0 ? "font-semibold text-success" : "")}>
          {pct(c.fxFeePct)}
        </span>
      ),
    },
    {
      key: "custody",
      label: "Custody",
      sortValue: (c) => c.custodyModel,
      csv: (c) => custodyLabel[c.custodyModel],
      render: (c) => <span className="whitespace-nowrap text-xs text-muted-foreground">{custodyLabel[c.custodyModel]}</span>,
    },
    {
      key: "network",
      label: "Network",
      sortValue: (c) => networkLabel[c.network],
      csv: (c) => networkLabel[c.network],
      render: (c) => <span className="whitespace-nowrap text-xs text-muted-foreground">{networkLabel[c.network]}</span>,
    },
  ],
  fees: [
    {
      key: "issuance",
      label: "Issuance",
      align: "right",
      sortValue: (c) => c.issuanceFeeUsd,
      csv: (c) => c.issuanceFeeUsd,
      render: (c) => <span className="num whitespace-nowrap text-xs">{feeLabel(c.issuanceFeeUsd)}</span>,
    },
    {
      key: "monthly",
      label: "Monthly / annual",
      align: "right",
      sortValue: (c) => c.annualFeeUsd,
      csv: (c) => c.annualFeeUsd,
      render: (c) => (
        <span className="num whitespace-nowrap text-xs">
          {feeLabel(c.monthlyFeeUsd)} / {feeLabel(c.annualFeeUsd, "None")}
        </span>
      ),
    },
    {
      key: "topup",
      label: "Crypto top-up",
      align: "right",
      sortValue: (c) => c.topupFeePct,
      csv: (c) => c.topupFeePct,
      render: (c) => <span className="num whitespace-nowrap text-xs">{pct(c.topupFeePct)}</span>,
    },
    {
      key: "fx",
      label: "FX fee",
      align: "right",
      sortValue: (c) => c.fxFeePct,
      csv: (c) => c.fxFeePct,
      render: (c) => (
        <span className={cn("num whitespace-nowrap text-xs", c.fxFeePct === 0 ? "font-semibold text-success" : "")}>
          {pct(c.fxFeePct)}
        </span>
      ),
    },
    {
      key: "atm",
      label: "ATM fee",
      align: "right",
      sortValue: (c) => c.atmFeePct,
      csv: (c) => c.atmFeePct,
      render: (c) => <span className="num whitespace-nowrap text-xs">{pct(c.atmFeePct)}</span>,
    },
  ],
  rewards: [
    {
      key: "cashbackMax",
      label: "Max cashback",
      align: "right",
      sortValue: (c) => c.cashbackMaxPct,
      csv: (c) => c.cashbackMaxPct,
      render: (c) => <span className="num whitespace-nowrap text-xs font-semibold text-success">{pct(c.cashbackMaxPct)}</span>,
    },
    {
      key: "payout",
      label: "Payout token",
      sortValue: (c) => c.payoutToken,
      csv: (c) => c.payoutToken,
      render: (c) => (
        <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">{c.payoutToken}</span>
      ),
    },
    {
      key: "staking",
      label: "Staking requirement",
      csv: (c) => c.stakingRequirement,
      render: (c) => <span className="whitespace-nowrap text-xs text-muted-foreground">{c.stakingRequirement}</span>,
    },
    {
      key: "perks",
      label: "Perks",
      width: "min-w-[280px]",
      csv: (c) => c.perks.join("; "),
      render: (c) => (
        <span className="line-clamp-2 text-xs leading-4 text-muted-foreground">{c.perks.join(" · ") || "—"}</span>
      ),
    },
  ],
  limits: [
    {
      key: "kyc",
      label: "KYC level",
      sortValue: (c) => c.kycLevel,
      csv: (c) => kycLabel[c.kycLevel],
      render: (c) => (
        <Badge tone={c.kycLevel === "no_kyc" ? "emerald" : "neutral"}>{kycLabel[c.kycLevel]}</Badge>
      ),
    },
    {
      key: "daily",
      label: "Max daily spend",
      align: "right",
      sortValue: (c) => c.maxDailySpendUsd,
      csv: (c) => c.maxDailySpendUsd,
      render: (c) => <span className="num whitespace-nowrap text-xs">{money(c.maxDailySpendUsd)}</span>,
    },
    {
      key: "atm",
      label: "Monthly ATM limit",
      align: "right",
      sortValue: (c) => c.monthlyAtmLimitUsd,
      csv: (c) => c.monthlyAtmLimitUsd,
      render: (c) => (
        <span className="num whitespace-nowrap text-xs">
          {c.monthlyAtmLimitUsd === 0 ? "No ATM" : money(c.monthlyAtmLimitUsd)}
        </span>
      ),
    },
    {
      key: "issuer",
      label: "Issuer bank",
      sortValue: (c) => c.issuerName,
      csv: (c) => c.issuerName,
      render: (c) => <span className="whitespace-nowrap text-xs text-muted-foreground">{c.issuerName}</span>,
    },
    {
      key: "audience",
      label: "Audience",
      csv: (c) => audienceLabel[c.audience],
      render: (c) => <span className="whitespace-nowrap text-xs text-muted-foreground">{audienceLabel[c.audience]}</span>,
    },
  ],
};

export function TableView({
  cards,
  selected,
  onToggleCompare,
  compareDisabled,
}: {
  cards: Card[];
  selected: string[];
  onToggleCompare: (slug: string) => void;
  compareDisabled: boolean;
}) {
  const [preset, setPreset] = useState<Preset>("overview");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({ key: "cashback", dir: "desc" });
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const active = columns[preset];

  const rows = useMemo(() => {
    const column = active.find((c) => c.key === sort.key);
    if (!column?.sortValue) return cards;
    const sorted = [...cards].sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      if (av === bv) return b.ratingScore - a.ratingScore;
      if (typeof av === "number" && typeof bv === "number") {
        return sort.dir === "asc" ? av - bv : bv - av;
      }
      return sort.dir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return sorted;
  }, [cards, active, sort]);

  const toggleSort = (column: Column) => {
    if (!column.sortValue) return;
    setSort((current) =>
      current.key === column.key
        ? { key: column.key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key: column.key, dir: column.align === "right" ? "desc" : "asc" },
    );
  };

  const exportCsv = () => {
    downloadCsv(
      `rituel-${preset}-2026.csv`,
      ["Card", "Slug", ...active.map((column) => column.label)],
      rows.map((card) => [card.name, card.slug, ...active.map((column) => column.csv(card))]),
    );
  };

  const toggleExpanded = (id: number) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="hide-scrollbar -mx-1 flex items-center gap-1 overflow-x-auto px-1">
          {PRESETS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setPreset(item.key);
                setSort({ key: "", dir: "desc" });
              }}
              className={cn(
                "whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition",
                preset === item.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-xs text-muted-foreground">
            {cards.length} card{cards.length === 1 ? "" : "s"} · {active.length} metrics
          </span>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" /> .CSV
          </button>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-sm font-semibold text-foreground">No cards match these filters.</p>
          <p className="mt-1 text-xs text-muted-foreground">Try removing a network or KYC filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className="sticky left-0 z-20 min-w-[182px] border-r border-border bg-muted px-2.5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Card
                </th>
                {active.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "whitespace-nowrap px-2.5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
                      column.align === "right" && "text-right",
                      column.width,
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(column)}
                      className={cn(
                        "inline-flex items-center gap-1",
                        column.sortValue ? "hover:text-foreground" : "cursor-default",
                        sort.key === column.key && "text-foreground",
                      )}
                      disabled={!column.sortValue}
                    >
                      {column.label}
                      {column.sortValue && (
                        <ArrowUpDown
                          className={cn("h-3 w-3", sort.key === column.key ? "text-success" : "text-muted-foreground")}
                        />
                      )}
                    </button>
                  </th>
                ))}
                <th className="px-2 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((card) => (
                <Row
                  key={card.id}
                  card={card}
                  columns={active}
                  expanded={expanded.has(card.id)}
                  onExpand={() => toggleExpanded(card.id)}
                  selected={selected.includes(card.slug)}
                  onToggleCompare={() => onToggleCompare(card.slug)}
                  compareDisabled={compareDisabled}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/40 px-3 py-2.5 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-muted-foreground" /> This table sorts on raw metrics only.
        </span>
        <span className="font-mono uppercase tracking-wider">Data · Oct 2026</span>
      </div>
    </div>
  );
}

function Row({
  card,
  columns,
  expanded,
  onExpand,
  selected,
  onToggleCompare,
  compareDisabled,
}: {
  card: Card;
  columns: Column[];
  expanded: boolean;
  onExpand: () => void;
  selected: boolean;
  onToggleCompare: () => void;
  compareDisabled: boolean;
}) {
  const hasTiers = card.tiers.length > 1;

  return (
    <>
      <tr className={cn("group border-b border-border/80 transition hover:bg-muted/50", expanded && "bg-muted/60")}>
        <td className="sticky left-0 z-10 border-r border-border bg-card px-2 py-2.5 group-hover:bg-muted/60">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExpand}
              disabled={!hasTiers}
              aria-expanded={expanded}
              aria-label={hasTiers ? `Show tiers for ${card.name}` : undefined}
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center rounded text-muted-foreground",
                hasTiers ? "hover:bg-muted hover:text-foreground" : "opacity-20",
              )}
            >
              {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
            <CardArt card={card} className="h-8 w-12 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <Link href={`/card/${card.slug}`} className="max-w-[132px] truncate text-xs font-semibold text-foreground hover:text-foreground">
                  {card.name}
                </Link>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span>{networkLabel[card.network]}</span>
                <span>·</span>
                <span className="num text-warning">★ {card.ratingScore.toFixed(1)}</span>
                {hasTiers && <span className="rounded bg-muted px-1 text-[9px] font-medium text-muted-foreground">{card.tiers.length} tiers</span>}
              </div>
            </div>
          </div>
        </td>

        {columns.map((column) => (
          <td
            key={column.key}
            className={cn("px-2.5 py-2.5 align-middle", column.align === "right" && "text-right", column.width)}
          >
            {column.render(card)}
          </td>
        ))}

        <td className="px-2 py-2.5 text-right">
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={onToggleCompare}
              disabled={!selected && compareDisabled}
              aria-pressed={selected}
              className={cn(
                "rounded-md border px-1.5 py-1 text-[10px] font-semibold transition",
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                !selected && compareDisabled && "cursor-not-allowed opacity-40",
              )}
            >
              {selected ? "Added" : "+ VS"}
            </button>
            <AffiliateLink
              slug={card.slug}
              cardName={card.name}
              source="directory-table"
              className="inline-flex items-center gap-0.5 rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/80"
            >
              Get <ExternalLink className="h-2.5 w-2.5" />
            </AffiliateLink>
          </div>
        </td>
      </tr>

      {expanded && hasTiers && (
        <tr className="border-b border-border bg-muted/40">
          <td colSpan={columns.length + 2} className="px-4 py-3">
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {card.name} tiers
                </h4>
                <span className="text-[10px] text-muted-foreground">{card.stakingRequirement}</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {card.tiers.map((tier) => (
                  <div key={tier.name} className="rounded-lg border border-border p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground">{tier.name}</span>
                      <span className="rounded bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">
                        {pct(tier.cashbackPct)} back
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground">
                      Stake: {tier.stake} · Annual: {feeLabel(tier.annualFeeUsd, "None")} · FX: {pct(tier.fxFeePct)}
                    </div>
                    <ul className="mt-1.5 space-y-0.5">
                      {tier.perks.map((perk) => (
                        <li key={perk} className="text-[10px] leading-4 text-muted-foreground">· {perk}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
