import { cards } from "@/lib/data";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";
import { supportedCountries } from "@/lib/taxonomy";

export const alt = "Rituel Cards — independent crypto card comparison";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Independent crypto card comparison",
    title: "Find the crypto card that actually pays you.",
    stats: [`${cards.length} cards tracked`, `${supportedCountries.length} country directories`, "Audited October 2026"],
  });
}
