import type { NextRequest } from "next/server";
import { isDatabaseConfigured, saveSubscriber } from "@/lib/db";

/** Submissions faster than this after the form rendered are almost always bots. */
const MIN_FILL_MS = 1500;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot and timing traps: answer like a success so bots don't learn to adapt.
  const startedAt = Number(body.startedAt);
  if (
    (typeof body.fax === "string" && body.fax.trim()) ||
    (Number.isFinite(startedAt) && Date.now() - startedAt < MIN_FILL_MS)
  ) {
    return Response.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || email.length > 320 || !EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }

  const subscriber = {
    email,
    country: request.headers.get("x-geo-country") || request.headers.get("cf-ipcountry") || "unknown",
  };

  if (!isDatabaseConfigured()) {
    console.error("[newsletter] DATABASE_URL not set; subscriber not stored", JSON.stringify(subscriber));
    return Response.json(
      { ok: false, error: "Subscriptions are temporarily unavailable." },
      { status: 503 },
    );
  }

  try {
    await saveSubscriber(subscriber);
  } catch (error) {
    console.error("[newsletter] Postgres insert failed", error);
    return Response.json(
      { ok: false, error: "We couldn't save your subscription. Please try again." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
