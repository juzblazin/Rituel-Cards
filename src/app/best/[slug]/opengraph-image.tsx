import { cards } from "@/lib/data";
import { plural } from "@/lib/format";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";
import { attributeBySlug, bestBySlug } from "@/lib/taxonomy";

export const alt = "Best crypto cards: fees, cashback and availability";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = bestBySlug.get(slug) ?? attributeBySlug.get(slug);
  if (!page) return renderOgImage({ eyebrow: "Best crypto cards", title: "Best list not found", stats: [] });
  const matched = cards.filter(page.filter);
  return renderOgImage({
    eyebrow: "Crypto card guide",
    title: page.title,
    stats: [`${plural(matched.length, "card")} compared`, `${matched.filter((card) => card.fxFeePct === 0).length} with 0% FX`, "Updated November 2026"],
  });
}
