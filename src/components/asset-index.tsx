import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Coins, Network } from "lucide-react";
import { cards } from "@/lib/data";
import { breadcrumbJsonLd } from "@/lib/seo";
import type { CryptoPage } from "@/lib/taxonomy";
import { cryptoPath } from "@/lib/paths";

const LOGOS: Record<string, string> = {
  usdt: "/crypto/tokens/usdt.png",
  usdc: "/crypto/tokens/usdc.png",
  btc: "/crypto/tokens/btc.png",
  eth: "/crypto/tokens/eth.png",
  sol: "/crypto/tokens/sol.png",
  monero: "/crypto/tokens/xmr.png",
  eure: "/crypto/tokens/eure.jpg",
  ethereum: "/crypto/chains/ethereum.png",
  solana: "/crypto/chains/solana.png",
  arbitrum: "/crypto/chains/arbitrum.jpg",
  base: "/crypto/chains/base.png",
  polygon: "/crypto/chains/polygon.png",
  tron: "/crypto/chains/tron.png",
  bitcoin: "/crypto/chains/bitcoin.png",
  gnosis: "/crypto/chains/gnosis.png",
  "bnb-chain": "/crypto/chains/bnb-chain.png",
};

const KIND_CONFIG = {
  token: {
    label: "Tokens",
    icon: Coins,
    title: "Spend the token you already hold",
    blurb:
      "Not every card supports every token. These pages map each programme to the assets it accepts for top-ups — USDT, USDC, BTC, ETH and more.",
    otherLabel: "Chains",
    otherPath: "/chains",
    otherBlurb: "See which networks each issuer supports for top-ups.",
  },
  chain: {
    label: "Chains",
    icon: Network,
    title: "Top up on the network you actually use",
    blurb:
      "Even fewer cards support the chain you hold funds on. These pages map each programme to the networks it accepts — Solana, Base, Arbitrum, Tron and more.",
    otherLabel: "Tokens",
    otherPath: "/tokens",
    otherBlurb: "See which tokens each card accepts for top-ups.",
  },
} as const;

export function AssetIndex({ pages, kind }: { pages: CryptoPage[]; kind: "token" | "chain" }) {
  const config = KIND_CONFIG[kind];
  const Icon = config.icon;
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: config.label, path: kind === "token" ? "/tokens" : "/chains" },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <div className="border-b border-border bg-background/60">
        <div className="container-page flex items-center gap-1.5 py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Crypto Card</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="font-medium text-muted-foreground">{config.label}</span>
        </div>
      </div>

      <div className="container-page py-12 sm:py-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Icon className="h-3 w-3" /> {config.label} · {pages.length} pages
          </div>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            {config.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{config.blurb}</p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {pages.map((page) => {
            const count = cards.filter(page.filter).length;
            return (
              <Link
                key={page.slug}
                href={cryptoPath(page)}
                className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm transition hover:bg-muted"
              >
                <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-black/5 dark:ring-white/15">
                  <Image
                    src={LOGOS[page.slug]}
                    alt=""
                    width={20}
                    height={20}
                    className="size-5 object-contain"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">{page.label}</span>
                  <span className="block text-[10px] text-muted-foreground">{count} cards</span>
                </span>
                <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
          <span>{config.otherBlurb}</span>
          <Link href={config.otherPath} className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4">
            Browse {config.otherLabel.toLowerCase()} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </>
  );
}
