"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  arr,
  catalogCard,
  ecosystem,
  entries,
  marketSharePct,
  type LeaderboardEntry,
} from "@/lib/leaderboard";
import { cn } from "@/lib/cn";
import { BrandMark } from "@/components/ui";

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

function trim(n: number, digits: number): string {
  return n.toFixed(digits).replace(/\.?0+$/, "");
}

function usdCompact(n: number): string {
  if (n >= 1e9) return `$${trim(n / 1e9, 2)}B`;
  if (n >= 1e6) return `$${trim(n / 1e6, 2)}M`;
  if (n >= 1e3) return `$${trim(n / 1e3, 1)}K`;
  return `$${n.toFixed(0)}`;
}

/* ------------------------------------------------------------------ */
/* Macro monthly volume series ($M), Mar 2023 – Oct 2026               */
/* ------------------------------------------------------------------ */

const MACRO: { t: number; label: string; v: number }[] = [
  { t: 0, label: "Mar '23", v: 0.25 },
  { t: 6, label: "Sep '23", v: 0.37 },
  { t: 9, label: "Dec '23", v: 9.27 },
  { t: 15, label: "Jun '24", v: 51.08 },
  { t: 21, label: "Dec '24", v: 153.4 },
  { t: 26, label: "May '25", v: 250.9 },
  { t: 28, label: "Jul '25", v: 339.7 },
  { t: 33, label: "Dec '25", v: 522.3 },
  { t: 36, label: "Mar '26", v: 736.4 },
  { t: 40, label: "Jul '26", v: 1042.0 },
  { t: 42, label: "Sep '26", v: 1231.0 },
  { t: 43, label: "Oct '26", v: 1370.0 },
];

const X_TICKS = new Set(["Mar '23", "Dec '23", "Jun '24", "Dec '24", "May '25", "Jul '25", "Dec '25", "Mar '26", "Jul '26", "Oct '26"]);
const MILESTONES = [
  { t: 28, label: "GENIUS Act" },
  { t: 40, label: "1st $1B month" },
];

function yTickLabel(v: number): string {
  if (v === 0) return "$0";
  return v >= 1000 ? `$${trim(v / 1000, 2)}B` : `$${v}M`;
}

function MacroChart() {
  const W = 800;
  const H = 224;
  const PAD = { l: 46, r: 12, t: 14, b: 24 };
  const MAX_T = 43;
  const MAX_V = 1450;
  const x = (t: number) => PAD.l + (t / MAX_T) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v / MAX_V) * (H - PAD.t - PAD.b);
  const gridlines = [0, 350, 700, 1050, 1400];

  const line = MACRO.map((d, i) => `${i === 0 ? "M" : "L"}${x(d.t).toFixed(1)},${y(d.v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(MAX_T).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Monthly card volume trend, March 2023 to October 2026">
      {gridlines.map((g) => (
        <g key={g}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(g)} y2={y(g)} className="stroke-border" strokeWidth={g === 0 ? 1.2 : 0.7} strokeDasharray={g === 0 ? undefined : "3 4"} />
          <text x={PAD.l - 6} y={y(g) + 3} textAnchor="end" className="fill-muted-foreground" fontSize={10}>
            {yTickLabel(g)}
          </text>
        </g>
      ))}

      {MILESTONES.map((m) => (
        <line
          key={m.label}
          x1={x(m.t)}
          x2={x(m.t)}
          y1={PAD.t}
          y2={y(0)}
          className="stroke-brand"
          strokeWidth={1}
          strokeDasharray="4 3"
          opacity={0.5}
        />
      ))}

      <path d={area} className="fill-brand" opacity={0.12} />
      <path d={line} className="stroke-brand" fill="none" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

      {MACRO.map((d) => (
        <circle key={d.label} cx={x(d.t)} cy={y(d.v)} r={3} className="fill-background stroke-brand" strokeWidth={1.5} vectorEffect="non-scaling-stroke">
          <title>{`${d.label}: ${yTickLabel(d.v)}`}</title>
        </circle>
      ))}

      {MACRO.filter((d) => X_TICKS.has(d.label)).map((d) => (
        <text key={d.label} x={x(d.t)} y={H - 6} textAnchor="middle" className="fill-muted-foreground" fontSize={9.5}>
          {d.label}
        </text>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Top-10 heavyweight table                                            */
/* ------------------------------------------------------------------ */

type MetricKey = "octVol" | "arr" | "allTime";

const METRICS: { key: MetricKey; label: string; column: string }[] = [
  { key: "octVol", label: "Oct 2026 Vol", column: "Oct 2026 volume" },
  { key: "arr", label: "Annualized (ARR)", column: "Annualized run-rate" },
  { key: "allTime", label: "Cumulative All-Time", column: "Cumulative volume" },
];

const metricValue = (e: LeaderboardEntry, key: MetricKey): number =>
  key === "octVol" ? e.monthlyVolumeUsd : key === "arr" ? arr(e) : e.allTimeVolumeUsd;

type Cohort = "anchor" | "club" | "challenger";

function cohortOf(entry: LeaderboardEntry): Cohort {
  if (entry.slug === "redotpay") return "anchor";
  if (arr(entry) >= 1e9) return "club";
  return "challenger";
}

const cohortMeta: Record<Cohort, { label: string; bar: string; badge: string }> = {
  anchor: { label: "#1 Market Anchor", bar: "bg-brand", badge: "bg-brand/10 text-brand" },
  club: { label: "$1B+ ARR Club", bar: "bg-info", badge: "bg-info/10 text-info" },
  challenger: { label: "Scaling Challenger", bar: "bg-muted-foreground/40", badge: "bg-muted text-muted-foreground" },
};

const top10 = entries
  .filter((e) => e.monthlyVolumeUsd > 0)
  .sort((a, b) => b.monthlyVolumeUsd - a.monthlyVolumeUsd)
  .slice(0, 10);

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function Heavyweights() {
  const [metric, setMetric] = useState<MetricKey>("octVol");
  const maxVal = Math.max(...top10.map((e) => metricValue(e, metric)));
  const activeColumn = METRICS.find((m) => m.key === metric)!;

  const kpiCards = [
    {
      label: "Cumulative volume",
      value: usdCompact(ecosystem.allTimeVolumeUsd),
      sub: `${ecosystem.monthsTracked} months · 30 programs`,
      valueClass: "text-foreground",
      subClass: "text-muted-foreground",
    },
    {
      label: "Oct 2026 volume",
      value: usdCompact(ecosystem.monthlyVolumeUsd),
      sub: `▲ +${ecosystem.momGrowthPct}% MoM velocity`,
      valueClass: "text-brand",
      subClass: "text-success font-medium",
    },
    {
      label: "Monthly card swipes",
      value: `${trim(ecosystem.monthlyTx / 1e6, 2)}M`,
      sub: `~${(ecosystem.monthlyTx / ecosystem.monthlyActiveSpenders).toFixed(1)} swipes / active user`,
      valueClass: "text-foreground",
      subClass: "text-muted-foreground",
    },
    {
      label: "Active spenders",
      value: `${trim(ecosystem.monthlyActiveSpenders / 1e3, 1)}K`,
      sub: "Unique wallets (30D)",
      valueClass: "text-foreground",
      subClass: "text-muted-foreground",
    },
  ];

  return (
    <section className="mt-14 flex flex-col gap-5">
      {/* Section header */}
      <div>
        <h2 className="max-w-3xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Crypto card volume surpassed <span className="font-bold">$1.37 billion</span> in October 2026, led by three
          billion-dollar run-rate giants
        </h2>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</div>
            <div className={cn("num mt-2 text-2xl font-bold", card.valueClass)}>{card.value}</div>
            <div className={cn("mt-1 text-xs", card.subClass)}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Macro trend chart */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Sector-wide monthly volume acceleration (Mar 2023 – Oct 2026)
            </h3>
            <p className="text-xs text-muted-foreground">
              Aggregate USD settlement throughput across all tracked stablecoin payment programs.
            </p>
          </div>
          <span className="text-xs font-medium text-brand">
            GENIUS Act (Jul '25: $339.7M) → 1st $1B month (Jul '26: $1.04B)
          </span>
        </div>
        <MacroChart />
      </div>

      {/* Top-10 heavyweight table */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Top 10 heavyweight programs: concentration &amp; run-rates
            </h3>
            <p className="text-xs text-muted-foreground">
              Individual card scale against the $1B annualized run-rate benchmark ($82.2M/mo).
            </p>
          </div>
          <div className="inline-flex self-start rounded-xl bg-muted p-1 text-xs font-medium">
            {METRICS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMetric(m.key)}
                aria-pressed={metric === m.key}
                className={cn(
                  "rounded-lg px-3 py-1.5 transition",
                  metric === m.key
                    ? "bg-brand font-semibold text-brand-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-foreground">ARR cohorts:</span>
          <span className="rounded bg-brand/10 px-2 py-0.5 font-medium text-brand">● RedotPay — #1 market anchor ($5.15B ARR)</span>
          <span className="rounded bg-info/10 px-2 py-0.5 font-medium text-info">● ether.fi &amp; KAST — $1B+ run-rate club</span>
          <span className="rounded bg-muted px-2 py-0.5 font-medium text-muted-foreground">● Scaling challengers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="w-10 py-2.5">#</th>
                <th className="py-2.5">Card program</th>
                <th className="py-2.5">Cohort status</th>
                <th className="w-1/3 py-2.5">Scale vs. leader</th>
                <th className="py-2.5 text-right">{activeColumn.column}</th>
                <th className="py-2.5 text-right">Market share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {top10.map((entry, index) => {
                const cohort = cohortOf(entry);
                const meta = cohortMeta[cohort];
                const card = catalogCard(entry);
                const value = metricValue(entry, metric);
                const widthPct = Math.max(2, (value / maxVal) * 100);
                return (
                  <tr key={entry.slug} className="text-sm transition-colors hover:bg-muted/50">
                    <td className="py-3 font-bold text-muted-foreground">{index + 1}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {card ? (
                          <BrandMark card={card} className="h-7 w-7 shrink-0 text-xs" />
                        ) : (
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-muted text-xs font-semibold text-muted-foreground ring-1 ring-foreground/10">
                            {entry.name.slice(0, 2)}
                          </span>
                        )}
                        {card ? (
                          <Link href={`/crypto-card/${card.slug}`} className="font-semibold text-foreground hover:text-brand">
                            {entry.name}
                          </Link>
                        ) : (
                          <span className="font-semibold text-foreground">{entry.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={cn("rounded px-2 py-0.5 text-xs font-medium", meta.badge)}>{meta.label}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className={cn("h-full rounded-full", meta.bar)} style={{ width: `${widthPct}%` }} />
                      </div>
                    </td>
                    <td className="num py-3 text-right font-bold text-foreground">{usdCompact(value)}</td>
                    <td className="num py-3 text-right font-medium text-muted-foreground">
                      {marketSharePct(entry).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footnote */}
      <p className="border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
        The chart tracks aggregate monthly USD settlement volume across the 30 ranked crypto card programs from March
        2023 through October 2026, reaching $13.87 billion cumulative. The table ranks the top 10 programs by October 2026
        monthly volume, highlighting the three members of the $1B+ annualized run-rate club — RedotPay, ether.fi and
        KAST. Data sources:{" "}
        <a href="https://paymentscan.xyz/" target="_blank" rel="noreferrer" className="underline hover:text-foreground">
          Paymentscan
        </a>
        ,{" "}
        <a
          href="https://waldenpay.com/crypto-card-statistics"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-foreground"
        >
          WaldenPay
        </a>
        .
      </p>
    </section>
  );
}
