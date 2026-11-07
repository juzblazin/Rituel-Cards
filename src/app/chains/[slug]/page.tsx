import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cryptoBySlug, cryptoPages } from "@/lib/taxonomy";
import { AssetPage, assetMetadata } from "@/components/asset-page";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

const chainPages = cryptoPages.filter((page) => page.kind === "chain");

export function generateStaticParams() {
  return chainPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = cryptoBySlug.get(slug);
  return page && page.kind === "chain" ? assetMetadata(page) : {};
}

export default async function ChainPage({ params }: Props) {
  const { slug } = await params;
  const page = cryptoBySlug.get(slug);
  if (!page || page.kind !== "chain") notFound();
  return <AssetPage page={page} />;
}
