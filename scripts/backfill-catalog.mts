import { readFileSync } from "node:fs";
import { Client } from "@neondatabase/serverless";
import { loadEnv } from "./env.mts";

/**
 * Applies the evidence-gated findings in `db/import/card-refresh-*.json`.
 *
 *   npm run db:backfill            # dry run: print what would change
 *   npm run db:backfill -- --write # apply in one transaction
 *   npm run db:sync                # refresh the app snapshot afterwards
 *
 * Only changes whose audit status is `apply` are written; held, manual and
 * rejected findings are ignored. Each touched card also gets `source_url` and
 * `last_verified_at` from the audit so the provenance is visible in the table.
 */

const AUDIT = "db/import/card-refresh-2026-10-28.json";

const CARD_COLUMNS = new Set([
  "network",
  "card_type",
  "custody_model",
  "audience",
  "kyc_level",
  "issuer_bank",
  "annual_fee_usd",
  "monthly_fee_usd",
  "issuance_physical_fee_usd",
  "topup_fee_pct",
  "fx_fee_pct",
  "atm_local_fee_pct",
  "cashback_min_pct",
  "cashback_max_pct",
  "payout_token",
  "staking_requirement",
  "regional_scope",
  "has_virtual",
  "has_physical",
  "supported_countries",
  "supported_cryptos",
  "supported_chains",
  "perks",
  "pros",
  "cons",
]);

const ARRAY_COLUMNS = new Set([
  "supported_countries",
  "supported_cryptos",
  "supported_chains",
  "perks",
  "pros",
  "cons",
]);

type AuditChange = {
  field: string;
  from?: unknown;
  to: unknown;
  status: string;
  evidence?: string;
};

type AuditCard = {
  slug: string;
  source_url?: string;
  confidence?: string;
  changes: AuditChange[];
};

type AuditFile = {
  meta: { generated_at: string };
  cards: AuditCard[];
};

type TierInput = {
  tier_name: string;
  tier_order: number;
  stake_or_portfolio_req?: string | null;
  cashback_pct?: number;
  annual_fee_usd?: number;
  monthly_fee_usd?: number;
  fx_fee_pct?: number;
  tier_perks?: string[];
};

/** Postgres array literal, so the driver never has to infer the element type. */
function arrayLiteral(values: string[]): string {
  const escaped = values.map((value) => `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`);
  return `{${escaped.join(",")}}`;
}

const write = process.argv.includes("--write");
const audit = JSON.parse(readFileSync(AUDIT, "utf8")) as AuditFile;
const verifiedOn = audit.meta.generated_at.slice(0, 10);

const planned = audit.cards
  .map((card) => ({
    card,
    applies: card.changes.filter((change) => change.status === "apply"),
  }))
  .filter((entry) => entry.applies.length > 0);

for (const { card, applies } of planned) {
  const fields = applies.map((change) => change.field);
  console.log(`${card.slug} (${verifiedOn})`);
  for (const change of applies) {
    const preview =
      typeof change.to === "string" ? change.to : JSON.stringify(change.to);
    console.log(`  ${change.field} -> ${preview.slice(0, 100)}`);
  }
  if (new Set(fields).size !== fields.length) {
    throw new Error(`${card.slug}: duplicate field in audit changes`);
  }
  for (const change of applies) {
    if (change.field !== "tiers" && !CARD_COLUMNS.has(change.field)) {
      throw new Error(`${card.slug}: unknown column ${change.field}`);
    }
  }
}

console.log(
  `\n${planned.length} cards, ${planned.reduce((sum, entry) => sum + entry.applies.length, 0)} changes.`,
);

if (!write) {
  console.log("Dry run — pass --write to apply.");
  process.exit(0);
}

const connectionString = loadEnv();
if (!connectionString) throw new Error("DATABASE_URL is not set");

const client = new Client(connectionString);
await client.connect();

try {
  await client.query("begin");

  for (const { card, applies } of planned) {
    const sets: string[] = [];
    const params: unknown[] = [];

    for (const change of applies) {
      if (change.field === "tiers") continue;
      params.push(
        ARRAY_COLUMNS.has(change.field)
          ? arrayLiteral((change.to as string[]).map(String))
          : change.to,
      );
      const placeholder = `$${params.length}`;
      sets.push(
        ARRAY_COLUMNS.has(change.field)
          ? `${change.field} = ${placeholder}::text[]`
          : `${change.field} = ${placeholder}`,
      );
    }

    params.push(card.source_url ?? null);
    sets.push(`source_url = $${params.length}`);
    params.push(verifiedOn);
    sets.push(`last_verified_at = $${params.length}`);
    params.push(card.slug);

    const updated = await client.query(
      `update cards set ${sets.join(", ")} where slug = $${params.length} returning id`,
      params,
    );
    if (updated.rowCount !== 1) {
      throw new Error(`${card.slug}: expected 1 row, updated ${updated.rowCount}`);
    }

    const tiers = applies.find((change) => change.field === "tiers");
    if (tiers) {
      const cardId = updated.rows[0].id as string;
      const rows = tiers.to as TierInput[];
      await client.query("delete from card_tiers where card_id = $1", [cardId]);
      for (const tier of rows) {
        await client.query(
          `insert into card_tiers
             (card_id, tier_name, tier_order, stake_or_portfolio_req,
              cashback_pct, annual_fee_usd, monthly_fee_usd, fx_fee_pct, tier_perks)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9::text[])`,
          [
            cardId,
            tier.tier_name,
            tier.tier_order,
            tier.stake_or_portfolio_req ?? null,
            tier.cashback_pct ?? 0,
            tier.annual_fee_usd ?? 0,
            tier.monthly_fee_usd ?? 0,
            tier.fx_fee_pct ?? 0,
            arrayLiteral((tier.tier_perks ?? []).map(String)),
          ],
        );
      }
      console.log(`${card.slug}: replaced ${rows.length} tiers`);
    }
  }

  await client.query("commit");
  console.log(`\nApplied ${planned.length} cards. Run \`npm run db:sync\` next.`);
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}
