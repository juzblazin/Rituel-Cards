import { cards } from "@/lib/data";
import { plural } from "@/lib/format";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";
import { cryptoBySlug } from "@/lib/taxonomy";

export const alt = "Crypto cards by token";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = cryptoBySlug.get(slug);
  const matched = page && page.kind === "token" ? cards.filter(page.filter) : [];
  return renderOgImage({
    eyebrow: "Crypto cards by token",
    title: page?.title ?? "Crypto cards by token",
    stats: [`${plural(matched.length, "card")} compared`, "Fees, cashback & chains", "Updated October 2026"],
  });
}
