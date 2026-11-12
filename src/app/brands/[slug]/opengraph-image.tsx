import { plural } from "@/lib/format";
import { issuerBySlug, issuers } from "@/lib/issuers";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";

export const alt = "Crypto card program comparison";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return issuers.map((issuer) => ({ slug: issuer.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const issuer = issuerBySlug.get(slug);
  if (!issuer) return renderOgImage({ eyebrow: "Card program", title: "Card program not found", stats: [] });
  return renderOgImage({
    eyebrow: "Card program",
    title:
      issuer.cards.length > 1
        ? `Compare ${issuer.name} crypto cards`
        : `${issuer.topCard.name} — fees, cashback and availability`,
    stats: [`${plural(issuer.cards.length, "card")}`, `${issuer.countryCount} countries`, "Updated November 2026"],
  });
}
