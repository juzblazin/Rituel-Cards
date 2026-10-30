import { cards } from "@/lib/data";
import { plural } from "@/lib/format";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";
import { attributeBySlug } from "@/lib/taxonomy";

export const alt = "Crypto card guide";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ attribute: string }> }) {
  const { attribute } = await params;
  const page = attributeBySlug.get(attribute);
  const matched = page ? cards.filter(page.filter) : [];
  return renderOgImage({
    eyebrow: "Crypto card guide",
    title: page?.title ?? "Crypto card guides",
    stats: [`${plural(matched.length, "card")} compared`, `${matched.filter((card) => card.fxFeePct === 0).length} with 0% FX`, "Updated October 2026"],
  });
}
