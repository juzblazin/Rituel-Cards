import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  let payload: unknown = null;
  try {
    payload = await request.json();
  } catch {
    return new Response(null, { status: 204 });
  }

  const data = payload as { slug?: string; card?: string; source?: string; ts?: number } | null;
  if (!data?.slug) return new Response(null, { status: 204 });

  console.info(
    "[analytics]",
    JSON.stringify({
      type: "affiliate_click",
      slug: data.slug,
      card: data.card,
      source: data.source,
      country: request.headers.get("x-geo-country") || request.headers.get("cf-ipcountry") || "unknown",
      ts: data.ts ?? Date.now(),
    }),
  );

  const webhook = process.env.ANALYTICS_WEBHOOK_URL;
  if (webhook) {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, type: "affiliate_click" }),
    }).catch(() => undefined);
  }

  return new Response(null, { status: 204 });
}
