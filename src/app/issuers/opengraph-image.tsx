import { cards } from "@/lib/data";
import { plural } from "@/lib/format";
import { infraProviders } from "@/lib/infra";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";

export const alt = "Crypto card issuing rails";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "Issuing rails",
    title: "Crypto card issuing rails",
    stats: [`${plural(infraProviders.length, "rail")}`, `${plural(cards.length, "card")} mapped`, "Updated November 2026"],
  });
}
