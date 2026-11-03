import { cardBySlug, cards } from "@/lib/data";
import { cashbackLabel, feeLabel, pct, plural, shortCardName } from "@/lib/format";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";
import { attributeBySlug } from "@/lib/taxonomy";

export const alt = "Crypto card review: fees, cashback and availability";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = attributeBySlug.get(slug);
  if (page) {
    const matched = cards.filter(page.filter);
    return renderOgImage({
      eyebrow: "Crypto card guide",
      title: page.title,
      stats: [`${plural(matched.length, "card")} compared`, `${matched.filter((card) => card.fxFeePct === 0).length} with 0% FX`, "Updated October 2026"],
    });
  }
  const card = cardBySlug.get(slug);
  if (!card) return renderOgImage({ eyebrow: "Crypto card review", title: "Crypto card not found", stats: [] });
  return renderOgImage({
    eyebrow: "Crypto card review",
    title: shortCardName(card.name),
    stats: [cashbackLabel(card), `${pct(card.fxFeePct)} FX`, `${feeLabel(card.annualFeeUsd, "No")} annual fee`, `Score ${card.ratingScore}/10`],
  });
}
