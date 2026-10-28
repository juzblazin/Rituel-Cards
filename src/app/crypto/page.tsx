import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Coins } from "lucide-react";
import { cards } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { cryptoPages } from "@/lib/taxonomy";

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

export const metadata: Metadata = buildMetadata({
  title: "Crypto Cards by Token & Chain — USDT, USDC, BTC, Solana & More",
  description:
    "Find crypto cards that support your token or chain. Compare USDT, USDC, BTC, ETH, SOL, Base, Arbitrum, Solana and Tron card programmes.",
  path: "/crypto",
});

export default function CryptoIndexPage() {
  const tokens = cryptoPages.filter((page) => page.kind === "token");
  const chains = cryptoPages.filter((page) => page.kind === "chain");

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          <Coins className="h-3 w-3" /> Tokens & chains
        </div>
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
          Spend the asset you already hold
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Not every card supports every token, and even fewer support the chain you actually use. These pages map
          each programme to the assets and networks it accepts for top-ups.
        </p>
      </div>

      <Section title="Tokens" pages={tokens} />
      <Section title="Networks & chains" pages={chains} />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
        <span>Looking for a specific country instead?</span>
        <Link href="/countries" className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4">
          Browse the geo directory <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function Section({ title, pages }: { title: string; pages: typeof cryptoPages }) {
  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground">{pages.length} pages</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {pages.map((page) => {
          const count = cards.filter(page.filter).length;
          return (
            <Link
              key={page.slug}
              href={`/crypto/${page.slug}`}
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
    </section>
  );
}
