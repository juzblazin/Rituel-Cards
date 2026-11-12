import { cards } from "@/lib/data";
import { plural } from "@/lib/format";
import { issuers } from "@/lib/issuers";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";

export const alt = "Crypto card programs";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "Card programs",
    title: "Crypto card programs",
    stats: [`${plural(issuers.length, "program")}`, `${plural(cards.length, "card")} tracked`, "Updated November 2026"],
  });
}
