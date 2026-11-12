import { cards } from "@/lib/data";
import { plural } from "@/lib/format";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";
import { cryptoBySlug, cryptoPages } from "@/lib/taxonomy";

export const alt = "Crypto cards by token";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return cryptoPages.filter((page) => page.kind === "token").map((page) => ({ slug: page.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = cryptoBySlug.get(slug);
  const matched = page && page.kind === "token" ? cards.filter(page.filter) : [];
  return renderOgImage({
    eyebrow: "Crypto cards by token",
    title: page?.title ?? "Crypto cards by token",
    stats: [`${plural(matched.length, "card")} compared`, "Fees, cashback & chains", "Updated November 2026"],
  });
}
