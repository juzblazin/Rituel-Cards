import type { NextRequest } from "next/server";

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

  const submission = {
    ...body,
    plan: PLANS.has(body.plan ?? "") ? body.plan : "free",
    receivedAt: new Date().toISOString(),
    country: request.headers.get("x-geo-country") || "unknown",
    id: `sub_${Date.now().toString(36)}`,
  };

  // No CRM is configured in this build. Log the lead and forward to a webhook if one exists.
  console.info("[card_submission]", JSON.stringify(submission));

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
