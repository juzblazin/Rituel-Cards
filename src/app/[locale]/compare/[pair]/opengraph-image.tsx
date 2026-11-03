import { cardBySlug } from "@/lib/data";
import { cashbackLabel, pct, shortCardName } from "@/lib/format";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";

export const alt = "Crypto card comparison";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const compared = pair.split("-vs-").map((slug) => cardBySlug.get(slug)).filter((card) => card !== undefined);
  return renderOgImage({
    eyebrow: "Head-to-head",
    title: compared.map((card) => shortCardName(card.name)).join(" vs ") || "Crypto card comparison",
    stats: compared.map((card) => `${shortCardName(card.name)}: ${pct(card.fxFeePct)} FX, ${cashbackLabel(card).toLowerCase()}`),
  });
}
