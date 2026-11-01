import type { MetadataRoute } from "next";
import { buildSitemapSection, sitemapSectionIds } from "@/lib/sitemap-sections";

// Blog posts change without a rebuild, so the sitemap is generated per request.
export const dynamic = "force-dynamic";

// /sitemap.xml stays the master urlset; per-section chunks live at
// /sitemap/{section}.xml via app/sitemap/[id]/route.ts.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const all = await Promise.all(sitemapSectionIds.map((id) => buildSitemapSection(id)));
  return all.flat();
}
