/** Shared validation for the "List your card" form, used by the browser and the API route. */

export type PlanKey = "free" | "verified" | "sponsored";
export const PLAN_KEYS: PlanKey[] = ["free", "verified", "sponsored"];

export type SubmissionInput = {
  company: string;
  cardName: string;
  email: string;
  plan: PlanKey;
  website?: string;
  contactName?: string;
  message?: string;
};

export type SubmissionField = "company" | "cardName" | "email" | "website" | "contactName" | "message";
export type SubmissionErrors = Partial<Record<SubmissionField, string>>;

export const SUBMISSION_LIMITS: Record<SubmissionField, number> = {
  company: 120,
  cardName: 120,
  email: 254,
  website: 300,
  contactName: 120,
  message: 4000,
};

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && url.hostname.includes(".");
  } catch {
    return false;
  }
}

export function validateSubmission(
  raw: Record<string, unknown>,
): { ok: true; value: SubmissionInput } | { ok: false; errors: SubmissionErrors } {
  const errors: SubmissionErrors = {};
  const company = text(raw.company);
  const cardName = text(raw.cardName);
  const email = text(raw.email).toLowerCase();
  let website = text(raw.website);
  const contactName = text(raw.contactName);
  const message = text(raw.message);

  if (!company) errors.company = "Enter the company or issuer name.";
  if (!cardName) errors.cardName = "Enter the card name.";
  if (!email) errors.email = "Enter your work email.";
  else if (!EMAIL.test(email)) errors.email = "Enter a valid email, like alex@acme.com.";

  if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`;
  if (website && !isHttpUrl(website)) errors.website = "Enter a full web address, like https://acme.com/card.";

  const values = { company, cardName, email, website, contactName, message };
  for (const field of Object.keys(SUBMISSION_LIMITS) as SubmissionField[]) {
    const limit = SUBMISSION_LIMITS[field];
    if (!errors[field] && values[field].length > limit) errors[field] = `Keep this under ${limit} characters.`;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const plan = PLAN_KEYS.includes(raw.plan as PlanKey) ? (raw.plan as PlanKey) : "free";
  return {
    ok: true,
    value: {
      company,
      cardName,
      email,
      plan,
      website: website || undefined,
      contactName: contactName || undefined,
      message: message || undefined,
    },
  };
}
