import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { cryptoPages } from "@/lib/taxonomy";
import { AssetIndex } from "@/components/asset-index";

export const metadata: Metadata = buildMetadata({
  title: "Crypto Cards by Chain — Solana, Base, Arbitrum, Tron & More",
  description:
    "Find crypto cards that support your network. Compare Solana, Ethereum, Base, Arbitrum, Polygon, Tron, Gnosis and BNB Chain card programmes.",
  path: "/chains",
});

export default function ChainsIndexPage() {
  return <AssetIndex pages={cryptoPages.filter((page) => page.kind === "chain")} kind="chain" />;
}
