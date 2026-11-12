import { cards } from "@/lib/data";
import { plural } from "@/lib/format";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";
import { bestPages } from "@/lib/taxonomy";

export const alt = "Best crypto card lists";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "Crypto card guides",
    title: "Best crypto card lists",
    stats: [`${plural(bestPages.length, "guide")}`, `${plural(cards.length, "card")} compared`, "Updated November 2026"],
  });
}
