import { cardBySlug, cards } from "@/lib/data";
import { cashbackLabel, feeLabel, pct, shortCardName } from "@/lib/format";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";

export const alt = "Crypto card review: fees, cashback and availability";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return cards.map((card) => ({ slug: card.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = cardBySlug.get(slug);
  if (!card) return renderOgImage({ eyebrow: "Crypto card review", title: "Crypto card not found", stats: [] });
  return renderOgImage({
    eyebrow: "Crypto card review",
    title: shortCardName(card.name),
    stats: [cashbackLabel(card), `${pct(card.fxFeePct)} FX`, `${feeLabel(card.annualFeeUsd, "No")} annual fee`, `Score ${card.ratingScore}/10`],
  });
}
