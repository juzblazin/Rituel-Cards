import type { NextRequest } from "next/server";
import { cardBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const card = cardBySlug.get(slug);

  if (!card) {
    return Response.redirect(new URL("/", request.url), 302);
  }

  let target: URL;
  try {
    target = new URL(card.affiliateUrl);
  } catch {
    return Response.redirect(new URL(`/card/${card.slug}`, request.url), 302);
  }

  const host = request.nextUrl.hostname.replace(/^www\./, "");
  target.searchParams.set("utm_source", host);
  target.searchParams.set("utm_medium", "directory");
  target.searchParams.set("utm_campaign", card.slug);
  target.searchParams.set("utm_content", request.nextUrl.searchParams.get("source") || "listing");

  const event = {
    type: "affiliate_click",
    slug: card.slug,
    card: card.name,
    source: request.nextUrl.searchParams.get("source") || "listing",
    country: request.headers.get("x-geo-country") || request.headers.get("cf-ipcountry") || "unknown",
    referer: request.headers.get("referer") || "",
    ts: new Date().toISOString(),
  };

  // Server-side click log. Swap for a DB insert or queue in production.
  console.info("[affiliate_click]", JSON.stringify(event));

  const webhook = process.env.ANALYTICS_WEBHOOK_URL;
  if (webhook) {
    void fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    }).catch(() => undefined);
  }

  const response = Response.redirect(target.toString(), 302);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
