import { llmsFullTxt } from "@/lib/llms";

// Regenerated per request so new blog posts appear without a rebuild.
export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(await llmsFullTxt(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
