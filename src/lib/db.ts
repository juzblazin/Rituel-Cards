import { neon } from "@neondatabase/serverless";

/**
 * Neon Postgres access.
 *
 * The HTTP driver (`neon()`) is used rather than a TCP pool: this app runs in
 * short-lived serverless functions, where a pool per instance exhausts Neon's
 * connection limit, and the HTTP driver is also the only one that works in
 * every runtime we may deploy to (Node functions and Cloudflare workerd).
 *
 * With no `DATABASE_URL` set, `isDatabaseConfigured()` is false and callers
 * keep their logging fallback, so local development and preview builds work
 * without a database. Schema lives in `db/schema.sql`, which is applied over
 * the direct (`DATABASE_URL_UNPOOLED`) connection.
 */

const connectionString = process.env.DATABASE_URL?.trim() || "";

export function isDatabaseConfigured(): boolean {
  return connectionString.length > 0;
}

type Sql = ReturnType<typeof neon>;

let client: Sql | null = null;

export function getSql(): Sql {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (or your host's environment variables) to enable Postgres.",
    );
  }
  client ??= neon(connectionString);
  return client;
}

export type PlanKey = "free" | "verified" | "sponsored";

export type CardSubmissionInput = {
  id: string;
  company: string;
  cardName: string;
  email: string;
  plan: PlanKey;
  website?: string;
  contactName?: string;
  message?: string;
  country?: string;
  receivedAt?: string;
};

export async function saveSubmission(input: CardSubmissionInput): Promise<void> {
  const sql = getSql();
  await sql`
    insert into card_submissions
      (id, company, card_name, email, plan, website, contact_name, message, country, received_at)
    values (
      ${input.id},
      ${input.company},
      ${input.cardName},
      ${input.email},
      ${input.plan},
      ${input.website ?? null},
      ${input.contactName ?? null},
      ${input.message ?? null},
      ${input.country ?? "unknown"},
      ${input.receivedAt ?? new Date().toISOString()}
    )
    on conflict (id) do nothing
  `;
}

export type AffiliateClickInput = {
  slug: string;
  card?: string;
  source?: string;
  country?: string;
  ts?: number;
};

export async function saveAffiliateClick(input: AffiliateClickInput): Promise<void> {
  const sql = getSql();
  await sql`
    insert into affiliate_clicks (slug, card, source, country, clicked_at)
    values (
      ${input.slug},
      ${input.card ?? null},
      ${input.source ?? null},
      ${input.country ?? "unknown"},
      ${new Date(input.ts ?? Date.now()).toISOString()}
    )
  `;
}
