import { Resend } from "resend";

/**
 * Transactional email through Resend.
 *
 * Resend is email only — it has no SMS product. Sending text messages needs a
 * separate provider, so nothing here covers that.
 *
 * With no `RESEND_API_KEY` set, `isEmailConfigured()` is false and `sendEmail()`
 * returns a failure result instead of throwing, so callers can treat mail as
 * best effort.
 */

const apiKey = process.env.RESEND_API_KEY?.trim() || "";

/** `onboarding@resend.dev` only delivers to the address on the Resend account; verify a domain to send anywhere. */
const fromAddress = process.env.EMAIL_FROM?.trim() || "RItuel <onboarding@resend.dev>";

const notifyRecipients = (process.env.EMAIL_NOTIFY_TO?.trim() || "hello@rituel.xyz")
  .split(",")
  .map((address) => address.trim())
  .filter(Boolean);

export function isEmailConfigured(): boolean {
  return apiKey.length > 0;
}

let client: Resend | null = null;

function getClient(): Resend {
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set. Add it to .env.local (or your host's environment variables).");
  }
  client ??= new Resend(apiKey);
  return client;
}

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export type SendEmailResult = { ok: true; id: string } | { ok: false; error: string };

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!isEmailConfigured()) {
    return { ok: false, error: "RESEND_API_KEY is not set." };
  }

  try {
    const { data, error } = await getClient().emails.send({
      from: fromAddress,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
    });

    if (error) {
      return { ok: false, error: error.message || "Resend rejected the message." };
    }
    return { ok: true, id: data?.id ?? "" };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Email send failed." };
  }
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

export type SubmissionEmailInput = {
  id: string;
  company: string;
  cardName: string;
  email: string;
  plan: string;
  website?: string;
  contactName?: string;
  message?: string;
  country?: string;
  receivedAt?: string;
};

export function buildSubmissionNotification(submission: SubmissionEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const rows: [string, string | undefined][] = [
    ["Reference", submission.id],
    ["Plan", submission.plan],
    ["Company", submission.company],
    ["Card", submission.cardName],
    ["Website", submission.website],
    ["Contact", submission.contactName],
    ["Email", submission.email],
    ["Country", submission.country],
    ["Received", submission.receivedAt],
  ];
  const filled = rows.filter((row): row is [string, string] => Boolean(row[1]));

  const subject = `[${submission.plan}] ${submission.company} — ${submission.cardName}`;
  const html = [
    `<h2 style="margin:0 0 12px;font:600 16px system-ui">New card submission</h2>`,
    `<table cellpadding="0" cellspacing="0" style="font:14px system-ui;border-collapse:collapse">`,
    ...filled.map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666">${escapeHtml(label)}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`,
    ),
    `</table>`,
    submission.message
      ? `<p style="font:14px system-ui;margin:16px 0 4px"><strong>Notes</strong></p><p style="font:14px system-ui;white-space:pre-wrap;margin:0">${escapeHtml(submission.message)}</p>`
      : "",
  ].join("");
  const text = [
    "New card submission",
    "",
    ...filled.map(([label, value]) => `${label}: ${value}`),
    submission.message ? `\nNotes:\n${submission.message}` : "",
  ].join("\n");

  return { subject, html, text };
}

/** Notifies the team inbox. Best effort — a mail failure must not lose a stored lead. */
export async function sendSubmissionNotification(submission: SubmissionEmailInput): Promise<SendEmailResult> {
  const { subject, html, text } = buildSubmissionNotification(submission);
  return sendEmail({
    to: notifyRecipients,
    subject,
    html,
    text,
    replyTo: submission.email,
  });
}
