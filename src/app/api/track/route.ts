import type { NextRequest } from "next/server";
import { isDatabaseConfigured, saveAffiliateClick } from "@/lib/db";

export async function POST(request: NextRequest) {
  let payload: unknown = null;
  try {
    payload = await request.json();
  } catch {
    return new Response(null, { status: 204 });
  }

  const data = payload as { slug?: string; card?: string; source?: string; ts?: number } | null;
  if (!data?.slug) return new Response(null, { status: 204 });

  const country =
    request.headers.get("x-geo-country") || request.headers.get("cf-ipcountry") || "unknown";
  const ts = data.ts ?? Date.now();

  console.info(
    "[analytics]",
    JSON.stringify({
      type: "affiliate_click",
      slug: data.slug,
      card: data.card,
      source: data.source,
      country,
      ts,
    }),
  );

  // Analytics must never break a redirect, so a failed insert is logged and swallowed.
  if (isDatabaseConfigured()) {
    try {
      await saveAffiliateClick({
        slug: data.slug,
        card: data.card,
        source: data.source,
        country,
        ts,
      });
    } catch (error) {
      console.error("[analytics] Postgres insert failed", error);
    }
  }

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
