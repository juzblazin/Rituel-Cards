import { plural } from "@/lib/format";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";
import { cardsForCountry, countryFromSlug, countryPageTitle } from "@/lib/taxonomy";

export const alt = "Crypto cards available by country";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ country: string }> }) {
  const { country: slug } = await params;
  const country = countryFromSlug(slug);
  const available = country ? cardsForCountry(country.code) : [];
  return renderOgImage({
    eyebrow: "Crypto cards by country",
    title: country ? countryPageTitle(country.name) : "Crypto cards by country",
    stats: [`${plural(available.length, "card")} available`, "Fees, cashback & KYC", "Updated October 2026"],
  });
}
