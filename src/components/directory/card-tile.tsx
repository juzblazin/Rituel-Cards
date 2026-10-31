import Link from "next/link";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import type { Card, MobileWallet } from "@/lib/data";
import { kycLabel, walletOptions } from "@/lib/data";
import { cashbackLabel, feeLabel, money, pct } from "@/lib/format";
import { countryByCode } from "@/lib/countries";
import { cn } from "@/lib/cn";
import { AffiliateLink } from "@/components/affiliate-link";
import { CardArt, Rating } from "@/components/ui";
import { buttonVariants } from "@/components/ui/button";

const cryptoTones: Record<string, string> = {
  BTC: "#f7931a",
  WBTC: "#f7931a",
  ETH: "#627eea",
  SOL: "#9945ff",
  USDC: "#2775ca",
  USDT: "#26a17b",
  XRP: "#0b0e11",
  LTC: "#a6a9aa",
  DOGE: "#c2a633",
  TRX: "#ff060a",
  CRO: "#1f6feb",
  NEXO: "#2f6bff",
  GNO: "#2f4d9b",
  EURe: "#0f3171",
  BNB: "#f3ba2f",
};

function compactCount(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })
    .format(value)
    .toLowerCase();
}

function shortCashback(card: Pick<Card, "cashbackMinPct" | "cashbackMaxPct">): string {
  const { cashbackMinPct: min, cashbackMaxPct: max } = card;
  if (max === 0) return "No cashback";
  if (min === max) return `${pct(min)} back`;
  if (min === 0) return `Up to ${pct(max)} back`;
  return `${pct(min)}–${pct(max)} back`;
}

function compactRegion(label: string): string {
  const global = label.match(/^Global \(([^)]+)\)$/);
  return global ? global[1] : label;
}

export function CardTile({
  card,
  displayCountry,
  selected,
  onToggleCompare,
  compareDisabled,
  source = "directory-grid",
  showSponsored = true,
}: {
  card: Card;
  displayCountry: string;
  selected: boolean;
  onToggleCompare: () => void;
  compareDisabled: boolean;
  source?: string;
  showSponsored?: boolean;
}) {
  const country = displayCountry !== "ALL" ? countryByCode.get(displayCountry) : undefined;
  const available = country ? card.supportedCountries.includes(country.code) : true;
  const wallets = walletOptions.filter((wallet) => card.mobileWallets.includes(wallet.value as MobileWallet));
  const walletLabels = wallets.map((wallet) => wallet.label.replace(" Pay", ""));
  const walletText = walletLabels.length === 0 ? "No wallet" : walletLabels.slice(0, 2).join(" / ");
  const visibleCryptos = card.supportedCryptos.slice(0, 4);
  const extraCryptos = card.supportedCryptos.slice(4);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border bg-card p-3.5 transition-[border-color,box-shadow,background-color] hover:border-brand/40 hover:shadow-[0_28px_70px_-44px_var(--brand)]",
        selected && "border-brand/60 bg-brand/[0.02] ring-1 ring-brand/25",
      )}
    >
      <Link
        href={`/crypto-card/${card.slug}`}
        className={cn(
          "relative block overflow-hidden rounded-xl border bg-muted/30 p-2.5 transition-colors",
          selected ? "border-brand/40 bg-brand/[0.04]" : "border-border/70",
        )}
        aria-label={`View ${card.name} details`}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,color-mix(in_oklab,var(--brand)_10%,transparent),transparent_70%)]"
          aria-hidden
        />
        <CardArt
          card={card}
          size="lg"
          className="relative aspect-[1.586/1] w-full rounded-lg shadow-[0_18px_40px_-24px_rgba(0,0,0,0.55)] transition-transform duration-300 group-hover:-translate-y-0.5"
        />
        {card.isSponsored && showSponsored && (
          <span className="absolute right-4 top-4 z-10 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white/80 backdrop-blur-sm">
            Sponsored
          </span>
        )}
      </Link>

      <div className="mt-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="flex min-w-0 items-center gap-1.5 text-[15px] font-semibold leading-tight tracking-tight">
            <Link
              href={`/crypto-card/${card.slug}`}
              className="truncate transition-colors group-hover:text-brand"
            >
              {card.name}
            </Link>
            {card.isVerified && (
              <svg
                viewBox="0 0 16 16"
                className="size-3.5 shrink-0 text-brand"
                aria-label="Verified listing"
                role="img"
              >
                <path
                  fill="currentColor"
                  d="M8 0.8 9.9 2.4l2.4-.2.7 2.3 2 1.4-.9 2.2.9 2.2-2 1.4-.7 2.3-2.4-.2L8 15.2l-1.9-1.6-2.4.2-.7-2.3-2-1.4.9-2.2-.9-2.2 2-1.4.7-2.3 2.4.2L8 .8Z"
                />
                <path
                  d="m5.4 8 1.7 1.7 3.5-3.5"
                  stroke="#fff"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </h3>

          <div className="shrink-0 text-right">
            <Rating score={card.ratingScore} />
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {compactCount(card.reviewCount)} reviews
            </p>
          </div>
        </div>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          by <span className="font-medium text-foreground/80">{card.issuerName}</span>
          <span aria-hidden className="px-1 text-border">
            •
          </span>
          {country ? (
            <span
              className={cn("font-medium", available ? "text-foreground/70" : "text-destructive")}
              title={
                available
                  ? `${card.name} is available in ${country.name}`
                  : `${card.name} is not available in ${country.name}`
              }
            >
              <span aria-hidden>{country.flag}</span> {country.name}
              {!available && " — unavailable"}
            </span>
          ) : (
            <span className="text-foreground/70">{compactRegion(card.regionLabel)}</span>
          )}
        </p>
      </div>

      <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-xs leading-5 text-muted-foreground">
        {card.tagline}
      </p>

      <div className="mt-3 grid grid-cols-3 divide-x divide-border/70 overflow-hidden rounded-xl border border-border/70 bg-muted/30">
        <span
          className="flex min-w-0 items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-medium"
          title={cashbackLabel(card)}
        >
          <span
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              card.cashbackMaxPct > 0 ? "bg-success" : "bg-muted-foreground/50",
            )}
            aria-hidden
          />
          <span className="truncate">{shortCashback(card)}</span>
        </span>
        <span className="flex min-w-0 items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-medium">
          <span
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              card.kycLevel === "no_kyc" ? "bg-success" : "bg-muted-foreground/50",
            )}
            aria-hidden
          />
          <span className="truncate">{kycLabel[card.kycLevel]}</span>
        </span>
        <span
          className="flex min-w-0 items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-medium"
          title={wallets.map((wallet) => wallet.label).join(", ") || "No mobile wallet"}
        >
          <span className="size-1.5 shrink-0 rounded-full bg-brand/70" aria-hidden />
          <span className="truncate">{walletText}</span>
        </span>
      </div>

      <div className="mt-3 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="shrink-0 font-medium text-muted-foreground/80">Supported</span>
        <span aria-hidden className="shrink-0 text-border">
          ·
        </span>
        <span className="flex min-w-0 items-center gap-2 overflow-hidden">
          {visibleCryptos.map((symbol) => (
            <span key={symbol} className="inline-flex shrink-0 items-center gap-1 font-mono text-[10px] font-medium">
              <span
                className="size-1.5 rounded-full"
                style={{ background: cryptoTones[symbol] ?? "var(--muted-foreground)" }}
                aria-hidden
              />
              {symbol}
            </span>
          ))}
          {extraCryptos.length > 0 && (
            <span
              className="shrink-0 font-mono text-[10px] text-muted-foreground/70"
              title={extraCryptos.join(", ")}
            >
              +{extraCryptos.length}
            </span>
          )}
        </span>
      </div>

      <dl className="mt-3.5 grid grid-cols-3 divide-x divide-border/70 border-y border-border/70 py-2.5 text-center">
        <div className="px-1">
          <dt className="text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Issuance</dt>
          <dd className="num mt-1 text-xs font-semibold">{feeLabel(card.issuanceFeeUsd)}</dd>
        </div>
        <div className="px-1">
          <dt className="text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Annual fee</dt>
          <dd className="num mt-1 text-xs font-semibold">
            {card.annualFeeUsd === 0 ? "$0/yr" : `${money(card.annualFeeUsd)}/yr`}
          </dd>
        </div>
        <div className="px-1">
          <dt className="text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Foreign FX</dt>
          <dd
            className={cn(
              "num mt-1 text-xs font-semibold",
              card.fxFeePct === 0 && "text-success",
            )}
          >
            {pct(card.fxFeePct)}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center gap-2 pt-3.5">
        <button
          type="button"
          onClick={onToggleCompare}
          disabled={!selected && compareDisabled}
          aria-pressed={selected}
          title={!selected && compareDisabled ? "You can compare up to 4 cards" : "Add to comparison"}
          className={cn(
            buttonVariants({ variant: selected ? "brand" : "outline", size: "sm" }),
            "flex-1",
            !selected && compareDisabled && "cursor-not-allowed opacity-50",
          )}
        >
          {selected ? <Check strokeWidth={2.5} /> : <Plus />}
          {selected ? "Added" : "Compare"}
        </button>

        <AffiliateLink
          slug={card.slug}
          cardName={card.name}
          source={source}
          className={cn(
            buttonVariants({ variant: "brand", size: "sm" }),
            "flex-[1.25] shadow-[0_10px_28px_-16px_var(--brand)]",
          )}
        >
          Get card <ArrowUpRight />
        </AffiliateLink>
      </div>
    </article>
  );
}
