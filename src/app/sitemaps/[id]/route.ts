import { notFound } from "next/navigation";
import { buildSitemapSection, sitemapSectionIds, type SitemapSectionId } from "@/lib/sitemap-sections";

export const dynamic = "force-dynamic";

const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const section = id.replace(/\.xml$/, "") as SitemapSectionId;
  if (!sitemapSectionIds.includes(section)) notFound();

  const entries = await buildSitemapSection(section);
  const urlset = entries
    .map((entry) => {
      const parts = [`    <loc>${escape(entry.url)}</loc>`];
      if (entry.lastModified) parts.push(`    <lastmod>${new Date(entry.lastModified).toISOString().slice(0, 10)}</lastmod>`);
      if (entry.changeFrequency) parts.push(`    <changefreq>${entry.changeFrequency}</changefreq>`);
      if (entry.priority !== undefined) parts.push(`    <priority>${entry.priority}</priority>`);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
  });
}
