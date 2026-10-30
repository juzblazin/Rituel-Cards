import type { NextRequest } from "next/server";
import { isDatabaseConfigured, saveSubmission } from "@/lib/db";
import { isEmailConfigured, sendSubmissionConfirmation, sendSubmissionNotification } from "@/lib/email";
import { validateSubmission } from "@/lib/submission";

/** Submissions faster than this after the form rendered are almost always bots. */
const MIN_FILL_MS = 2500;

/** Reports which delivery channels are configured (booleans only) so a deploy can be checked from outside. */
export function GET() {
  return Response.json({
    database: isDatabaseConfigured(),
    email: isEmailConfigured(),
    webhook: Boolean(process.env.SUBMISSIONS_WEBHOOK_URL),
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot and timing traps: answer like a success so bots don't learn to adapt.
  const startedAt = Number(body.startedAt);
  if (text(body.fax) || (Number.isFinite(startedAt) && Date.now() - startedAt < MIN_FILL_MS)) {
    return Response.json({ ok: true, id: "sub_received", plan: "free" });
  }

  const result = validateSubmission(body);
  if (!result.ok) {
    return Response.json(
      { ok: false, error: "Please fix the highlighted fields.", fieldErrors: result.errors },
      { status: 400 },
    );
  }

  const submission = {
    id: `sub_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    ...result.value,
    receivedAt: new Date().toISOString(),
    country: request.headers.get("x-geo-country") || request.headers.get("cf-ipcountry") || "unknown",
  };

  const webhook = process.env.SUBMISSIONS_WEBHOOK_URL;
  if (!isDatabaseConfigured() && !isEmailConfigured() && !webhook) {
    console.error("[card_submission] no DATABASE_URL, RESEND_API_KEY or SUBMISSIONS_WEBHOOK_URL; lead not stored", JSON.stringify(submission));
    return Response.json(
      { ok: false, error: "Submissions are temporarily unavailable. Email hello@rituel.xyz instead." },
      { status: 503 },
    );
  }

  let stored = false;
  if (isDatabaseConfigured()) {
    try {
      await saveSubmission(submission);
      stored = true;
    } catch (error) {
      console.error("[card_submission] Postgres insert failed", error);
    }
  }

  let notified = false;
  if (isEmailConfigured()) {
    const sent = await sendSubmissionNotification(submission);
    notified = sent.ok;
    if (!sent.ok) console.error("[card_submission] notification email failed:", sent.error);
  }

  let forwarded = false;
  if (webhook) {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    }).catch(() => null);
    forwarded = Boolean(response?.ok);
    if (!forwarded) console.error("[card_submission] webhook delivery failed");
  }

  // Success only if the lead landed somewhere a person will see it.
  if (!stored && !notified && !forwarded) {
    return Response.json(
      { ok: false, error: "We couldn't save your submission. Please try again or email hello@rituel.xyz." },
      { status: 502 },
    );
  }

  if (isEmailConfigured()) {
    const confirmed = await sendSubmissionConfirmation(submission);
    if (!confirmed.ok) console.warn("[card_submission] confirmation email skipped:", confirmed.error);
  }

  return Response.json({ ok: true, id: submission.id, plan: submission.plan });
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
