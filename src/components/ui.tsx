import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Card } from "@/lib/data";
import { networkLabel } from "@/lib/data";
import { cn } from "@/lib/cn";
import { Badge as ShadBadge, type BadgeProps } from "@/components/ui/badge";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex h-8 shrink-0 items-center", className)} aria-hidden>
      <img
        src="/logo.svg"
        alt=""
        width={1298}
        height={386}
        className="h-full w-auto object-contain dark:hidden"
      />
      <img
        src="/logo-dark.svg"
        alt=""
        width={1298}
        height={386}
        className="hidden h-full w-auto object-contain dark:block"
      />
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center", className)} aria-label="Rituel Cards home">
      <LogoMark />
    </Link>
  );
}

export function Rating({ score, className }: { score: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold text-foreground", className)}>
      <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
      <span className="num">{score.toFixed(1)}</span>
      <span className="font-normal text-muted-foreground">/10</span>
    </span>
  );
}

export function Stars({ score, className }: { score: number; className?: string }) {
  return (
    <span className={cn("flex items-center gap-1", className)} aria-label={`${score.toFixed(1)} out of 10`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, score / 2 - i));
        return (
          <span key={i} className="relative inline-block size-3.5">
            <Star className="absolute inset-0 size-3.5 text-border" aria-hidden />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
            </span>
          </span>
        );
      })}
    </span>
  );
}

const badgeTones: Record<string, BadgeProps["variant"]> = {
  neutral: "outline",
  emerald: "success",
  dark: "default",
  amber: "warning",
  violet: "secondary",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof badgeTones;
  className?: string;
}) {
  return (
    <ShadBadge variant={badgeTones[tone]} className={className}>
      {children}
    </ShadBadge>
  );
}

export function CardArt({
  card,
  className,
  size = "sm",
}: {
  card: Pick<Card, "name" | "logoText" | "brand" | "network" | "isSponsored" | "cardImageUrl">;
  className?: string;
  size?: "sm" | "lg";
}) {
  if (card.cardImageUrl) {
    return (
      <div
        className={cn("relative isolate overflow-hidden rounded-lg ring-1 ring-foreground/10", className)}
        role="img"
        aria-label={card.name}
      >
        <Image
          src={card.cardImageUrl}
          alt=""
          fill
          sizes="(max-width: 640px) 90vw, 340px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn("tile-shine relative isolate overflow-hidden rounded-lg ring-1 ring-foreground/10", className)}
      style={{ background: `linear-gradient(140deg, ${card.brand.from} 4%, ${card.brand.to} 96%)` }}
      role="img"
      aria-label={`${card.name} card artwork`}
    >
      <div className="absolute -right-6 -top-8 size-24 rounded-full bg-white/10 blur-2xl" aria-hidden />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "repeating-linear-gradient(125deg, #fff 0 1px, transparent 1px 14px)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(130%_90%_at_12%_-10%,rgba(255,255,255,0.4),transparent_58%)]"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/25 via-black/5 to-transparent"
        aria-hidden
      />
      <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/20" aria-hidden />
      <div className={cn("relative flex h-full flex-col justify-between", size === "lg" ? "p-4" : "p-1.5")}>
        <div className="flex items-start justify-between">
          <span
            className={cn(
              "font-semibold leading-none tracking-tight",
              size === "lg" ? "text-3xl" : "text-[11px]",
            )}
            style={{ color: card.brand.ink }}
          >
            {card.logoText}
          </span>
          <span
            className={cn("font-mono uppercase tracking-[0.14em] opacity-80", size === "lg" ? "text-[10px]" : "text-[6px]")}
            style={{ color: card.brand.ink }}
          >
            {networkLabel[card.network]}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-1.5 opacity-90" style={{ color: card.brand.ink }}>
            <span
              className={cn("rounded-[3px] border border-white/40 bg-white/20", size === "lg" ? "h-5 w-7" : "h-2.5 w-4")}
            />
            <svg viewBox="0 0 16 16" className={cn(size === "lg" ? "size-4" : "size-2.5")} fill="none" aria-hidden>
              <path d="M2 6c3 0 4 4 6 4s3-4 6-4M2 10c3 0 4 4 6 4s3-4 6-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <span
            className={cn("max-w-[70%] truncate font-medium tracking-tight opacity-85", size === "lg" ? "text-sm" : "text-[8px]")}
            style={{ color: card.brand.ink }}
          >
            {card.name}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Issuer logos present in /public/logos, keyed by normalised brand token. */
const ISSUER_LOGOS: Record<string, string> = {
  bitget: "bitget.png",
  bitpay: "bitpay.png",
  bleap: "bleap.png",
  bybit: "bybit.png",
  coca: "coca.png",
  cryptocom: "cryptocom.png",
  etherfi: "etherfi.png",
  gnosis: "gnosispay.png",
  jupiter: "jupiter.png",
  kast: "kast.png",
  kraken: "kraken.png",
  lava: "lava.png",
  metamask: "metamask.png",
  mexc: "mexc.png",
  nexo: "nexo.png",
  nocturne: "nocturne.svg",
  okx: "okx.png",
  plasma: "plasma.png",
  plutus: "plutus.svg",
  redotpay: "redotpay.png",
  solidyield: "solidyield.png",
  wirex: "wirex.png",
};

function issuerLogoKey(name: string): string {
  return name
    .split(" - ")[0]
    ?.trim()
    .split(/\s+/)[0]
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "") ?? "";
}

/**
 * Square issuer mark: the real logo file when one exists in /public/logos,
 * otherwise a monogram tile on the card's brand gradient.
 */
export function BrandMark({
  card,
  className,
}: {
  card: Pick<Card, "name" | "logoText" | "brand">;
  className?: string;
}) {
  const key = issuerLogoKey(card.name);
  const file = ISSUER_LOGOS[key];
  if (file) {
    return (
      <div
        className={cn(
          "relative isolate shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-foreground/10",
          className,
        )}
        role="img"
        aria-label={`${card.name} issuer logo`}
      >
        <Image src={`/logos/${file}`} alt="" fill sizes="64px" className="object-contain p-[3px]" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative isolate grid shrink-0 place-items-center overflow-hidden rounded-md ring-1 ring-foreground/10",
        className,
      )}
      style={{ background: `linear-gradient(140deg, ${card.brand.from} 4%, ${card.brand.to} 96%)` }}
      role="img"
      aria-label={`${card.name} issuer logo`}
    >
      <span className="font-semibold leading-none tracking-tight" style={{ color: card.brand.ink }}>
        {card.logoText}
      </span>
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} />;
}

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
