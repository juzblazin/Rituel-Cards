import { cards } from "@/lib/data";
import { plural } from "@/lib/format";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";
import { cryptoBySlug } from "@/lib/taxonomy";

export const alt = "Crypto cards by token or chain";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const page = cryptoBySlug.get(token);
  const matched = page ? cards.filter(page.filter) : [];
  return renderOgImage({
    eyebrow: "Crypto cards by asset",
    title: page?.title ?? "Crypto cards by token and chain",
    stats: [`${plural(matched.length, "card")} compared`, "Fees, cashback & chains", "Updated October 2026"],
  });
}
