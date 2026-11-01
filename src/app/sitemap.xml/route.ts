import { absoluteUrl } from "@/lib/site";
import { sitemapSectionIds } from "@/lib/sitemap-sections";

export const dynamic = "force-dynamic";

// Sitemap index — references the per-section sub-sitemaps only.
export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapSectionIds.map((id) => `  <sitemap><loc>${absoluteUrl(`/sitemaps/${id}.xml`)}</loc></sitemap>`).join("\n")}
</sitemapindex>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
  });
}
