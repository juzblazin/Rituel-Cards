import { cards } from "@/lib/data";
import { plural } from "@/lib/format";
import { cardsOnRail, infraBySlug, infraProviders } from "@/lib/infra";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";

export const alt = "Cards powered by a crypto card issuing rail";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return infraProviders.map((provider) => ({ slug: provider.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const provider = infraBySlug.get(slug);
  if (!provider) return renderOgImage({ eyebrow: "Issuing rail", title: "Issuing rail not found", stats: [] });
  const powered = cardsOnRail(provider, cards);
  return renderOgImage({
    eyebrow: "Issuing rail",
    title: `Cards powered by ${provider.name}`,
    stats: [`${plural(powered.length, "card")}`, "Licences, pros & cons", "Updated November 2026"],
  });
}
