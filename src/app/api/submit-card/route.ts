import type { NextRequest } from "next/server";
import { isDatabaseConfigured, saveSubmission, type PlanKey } from "@/lib/db";
import { isEmailConfigured, sendSubmissionNotification } from "@/lib/email";

type Submission = {
  company?: string;
  contactName?: string;
  email?: string;
  cardName?: string;
  website?: string;
  plan?: string;
  message?: string;
};

const PLANS = new Set(["free", "verified", "sponsored"]);

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Submission | null;

  if (!body?.company || !body?.email || !body?.cardName) {
    return Response.json({ ok: false, error: "Company, email and card name are required." }, { status: 400 });
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) {
    return Response.json({ ok: false, error: "Enter a valid work email." }, { status: 400 });
  }

  const { company, email, cardName } = body;
  const plan: PlanKey = PLANS.has(body.plan ?? "") ? (body.plan as PlanKey) : "free";

  const submission = {
    id: `sub_${Date.now().toString(36)}`,
    company,
    cardName,
    email,
    plan,
    website: body.website,
    contactName: body.contactName,
    message: body.message,
    receivedAt: new Date().toISOString(),
    country: request.headers.get("x-geo-country") || "unknown",
  };

  if (isDatabaseConfigured()) {
    try {
      await saveSubmission(submission);
    } catch (error) {
      console.error("[card_submission] Postgres insert failed", error);
      return Response.json(
        { ok: false, error: "Could not save the submission. Email us instead." },
        { status: 502 },
      );
    }
  } else {
    // No database configured (local development). Keep the lead in the log.
    console.info("[card_submission]", JSON.stringify(submission));
  }

  // Best effort: the lead is already durable in Postgres, so a mail failure is logged, not fatal.
  if (isEmailConfigured()) {
    const notified = await sendSubmissionNotification(submission);
    if (!notified.ok) console.error("[card_submission] notification email failed:", notified.error);
  }

  const webhook = process.env.SUBMISSIONS_WEBHOOK_URL;
  if (webhook) {
    const forwarded = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    }).catch(() => null);
    if (!forwarded?.ok) {
      return Response.json({ ok: false, error: "Could not deliver the submission. Email us instead." }, { status: 502 });
    }
  }

  return Response.json({ ok: true, id: submission.id, plan: submission.plan });
}
