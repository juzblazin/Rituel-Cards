import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { cryptoPages } from "@/lib/taxonomy";
import { AssetIndex } from "@/components/asset-index";

export const metadata: Metadata = buildMetadata({
  title: "Crypto Cards by Token — USDT, USDC, BTC, ETH & More",
  description:
    "Find crypto cards that support your token. Compare USDT, USDC, BTC, ETH, SOL, EURe and Monero card programmes on fees and cashback.",
  path: "/tokens",
});

export default function TokensIndexPage() {
  return <AssetIndex pages={cryptoPages.filter((page) => page.kind === "token")} kind="token" />;
}
