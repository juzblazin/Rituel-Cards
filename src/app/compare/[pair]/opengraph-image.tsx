import { cardBySlug } from "@/lib/data";
import { cashbackLabel, pct, shortCardName } from "@/lib/format";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";
import { absoluteUrl } from "@/lib/site";
import { featuredPairs } from "@/lib/taxonomy";

export const alt = "Crypto card comparison";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export function generateStaticParams() {
  return featuredPairs.map((pair) => ({ pair: pair.slug }));
}

const featuredSlugs = new Set(featuredPairs.map((pair) => pair.slug));

export default async function Image({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  // Compare pages resolve any valid pair dynamically, so non-featured pairs
  // are never prerendered. Point them at the shared image — a plain redirect
  // keeps ImageResponse (and its wasm) out of the edge runtime.
  if (!featuredSlugs.has(pair)) {
    return Response.redirect(absoluteUrl("/opengraph-image"), 308);
  }
  const compared = pair.split("-vs-").map((slug) => cardBySlug.get(slug)).filter((card) => card !== undefined);
  return renderOgImage({
    eyebrow: "Head-to-head",
    title: compared.map((card) => shortCardName(card.name)).join(" vs ") || "Crypto card comparison",
    stats: compared.map((card) => `${shortCardName(card.name)}: ${pct(card.fxFeePct)} FX, ${cashbackLabel(card).toLowerCase()}`),
  });
}
