import { cards } from "@/lib/data";
import { plural } from "@/lib/format";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";
import { useCaseBySlug } from "@/lib/taxonomy";

export const alt = "Crypto cards by use case";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = useCaseBySlug.get(slug);
  if (!page) return renderOgImage({ eyebrow: "Crypto card use cases", title: "Use case not found", stats: [] });
  const matched = cards.filter(page.filter);
  return renderOgImage({
    eyebrow: "Crypto card use case",
    title: page.title,
    stats: [`${plural(matched.length, "card")} compared`, `${matched.filter((card) => card.fxFeePct === 0).length} with 0% FX`, "Updated October 2026"],
  });
}
