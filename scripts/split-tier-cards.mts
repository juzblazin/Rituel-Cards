import { mkdirSync, writeFileSync } from "node:fs";
import { Client } from "@neondatabase/serverless";
import { loadEnv } from "./env.mts";

/**
 * Turns tiered products into one card row per tier.
 *
 *   npm run db:split-tiers            # dry run: print the variants
 *   npm run db:split-tiers -- --write # apply in one transaction
 *   npm run db:sync                   # refresh the app snapshot afterwards
 *
 * A row with card_tiers is replaced by one row per tier, named
 * `<product> - <tier> Card` (e.g. "Bybit - Standard Card"). Everything is
 * copied from the parent row; the tier's cashback, fees, FX, stake, ATM
 * allowance and perks win where the tier defines them. The lowest tier keeps
 * the parent slug, so existing /card, /compare and logo references keep
 * resolving; later tiers get `<parent-slug>-<tier>`.
 *
 * The parent id is reused for the first variant, so no card rows are deleted —
 * only its card_tiers rows, which the variants replace.
 */

const WRITE = process.argv.includes("--write");

type Row = Record<string, unknown>;

type ColumnMeta = {
  column_name: string;
  udt_name: string;
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** "Bybit Card" -> "Bybit"; "ether.fi Cash" is left alone. */
function baseName(name: string): string {
  return name.replace(/\s+card$/i, "").trim() || name;
}

function arrayLiteral(values: string[]): string {
  const escaped = values.map(
    (value) =>
      `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`,
  );
  return `{${escaped.join(",")}}`;
}

function pick(value: unknown, fallback: unknown): unknown {
  return value === null || value === undefined || value === "" ? fallback : value;
}

function bind(meta: ColumnMeta, value: unknown, index: number) {
  const placeholder = `$${index}`;
  if (meta.udt_name.startsWith("_")) {
    return {
      sql: `${placeholder}::text[]`,
      value: arrayLiteral(Array.isArray(value) ? value.map(String) : []),
    };
  }
  if (meta.udt_name === "jsonb") {
    return { sql: `${placeholder}::jsonb`, value: JSON.stringify(value ?? []) };
  }
  if (meta.udt_name === "date") {
    return { sql: `${placeholder}::date`, value: value ?? null };
  }
  return { sql: placeholder, value: value ?? null };
}

const connectionString = loadEnv();
if (!connectionString) throw new Error("DATABASE_URL is not set");

const client = new Client(connectionString);
await client.connect();

try {
  const cards = (await client.query(
    "select * from cards order by sponsor_priority asc, rating_score desc, name asc",
  )).rows as Row[];

  const tiers = (await client.query(
    "select * from card_tiers order by card_id, tier_order asc, tier_name asc",
  )).rows as Row[];

  const columns = (await client.query(
    `select column_name, udt_name
       from information_schema.columns
      where table_name = 'cards'
        and is_generated = 'NEVER'
        and column_name not in ('id', 'created_at', 'updated_at')
      order by ordinal_position`,
  )).rows as ColumnMeta[];

  const tiersByCard = new Map<string, Row[]>();
  for (const tier of tiers) {
    const key = String(tier.card_id);
    const bucket = tiersByCard.get(key);
    if (bucket) bucket.push(tier);
    else tiersByCard.set(key, [tier]);
  }

  const parents = cards.filter((card) => tiersByCard.has(String(card.id)));
  if (parents.length === 0) {
    console.log("No tiered cards found; nothing to split.");
    process.exit(0);
  }

  const takenSlugs = new Set(cards.map((card) => String(card.slug)));
  const uniqueSlug = (preferred: string): string => {
    if (!takenSlugs.has(preferred)) {
      takenSlugs.add(preferred);
      return preferred;
    }
    let suffix = 2;
    while (takenSlugs.has(`${preferred}-${suffix}`)) suffix += 1;
    const slug = `${preferred}-${suffix}`;
    takenSlugs.add(slug);
    return slug;
  };

  type Variant = {
    parent: Row;
    tier: Row;
    slug: string;
    name: string;
    row: Row;
  };

  const variants: Variant[] = [];
  const anomalies: string[] = [];

  for (const parent of parents) {
    const cardTiers = tiersByCard.get(String(parent.id)) ?? [];
    const parentPerks = Array.isArray(parent.perks)
      ? (parent.perks as string[])
      : [];

    cardTiers.forEach((tier, index) => {
      const tierName = String(tier.tier_name);
      const slug =
        index === 0
          ? String(parent.slug)
          : uniqueSlug(`${String(parent.slug)}-${slugify(tierName)}`);

      const row: Row = { ...parent };
      delete row.id;
      delete row.created_at;
      delete row.updated_at;
      delete row.search_vector;

      const pct = Number(tier.cashback_pct ?? 0);
      const tierPerks = Array.isArray(tier.tier_perks)
        ? (tier.tier_perks as string[])
        : [];
      const perks = [...new Set([...parentPerks, ...tierPerks])];
      const travel = Number(tier.travel_reward_pct ?? 0);

      row.name = `${baseName(String(parent.name))} - ${tierName} Card`;
      row.slug = slug;
      row.parent_slug = parent.slug;
      row.cashback_min_pct = pct;
      row.cashback_max_pct = pct;
      row.annual_fee_usd = pick(tier.annual_fee_usd, parent.annual_fee_usd);
      row.monthly_fee_usd = pick(tier.monthly_fee_usd, parent.monthly_fee_usd);
      row.fx_fee_pct = pick(tier.fx_fee_pct, parent.fx_fee_pct);
      row.staking_requirement = pick(
        tier.stake_or_portfolio_req,
        parent.staking_requirement,
      );
      row.atm_monthly_free_allowance_usd = pick(
        tier.atm_free_allowance_usd,
        parent.atm_monthly_free_allowance_usd,
      );
      row.monthly_atm_limit_usd = pick(
        tier.atm_monthly_cap_usd,
        parent.monthly_atm_limit_usd,
      );
      row.daily_spend_limit_usd = pick(
        tier.daily_spend_limit_usd,
        parent.daily_spend_limit_usd,
      );
      row.balance_yield_apy_pct = pick(
        tier.balance_yield_apy_pct,
        parent.balance_yield_apy_pct,
      );
      row.cashback_cap_monthly_usd = pick(
        tier.cashback_cap_monthly_usd,
        parent.cashback_cap_monthly_usd,
      );
      row.topup_cap_monthly_usd = pick(
        tier.topup_cap_monthly_usd,
        parent.topup_cap_monthly_usd,
      );
      row.perks = perks;
      row.has_metal =
        Boolean(parent.has_metal) || perks.some((perk) => /metal/i.test(perk));

      if (travel > 0) {
        const categories = Array.isArray(parent.reward_categories)
          ? parent.reward_categories
          : [];
        row.reward_categories = [
          ...categories,
          { category: "travel", pct: travel },
        ];
      }

      if (pct === 0 && Number(parent.cashback_max_pct ?? 0) > 0) {
        anomalies.push(
          `${String(parent.name)} / ${tierName}: tier says 0% while the product advertises up to ${String(parent.cashback_max_pct)}%`,
        );
      }

      variants.push({
        parent,
        tier,
        slug,
        name: String(row.name),
        row,
      });
    });
  }

  console.log(
    `\n${parents.length} tiered products -> ${variants.length} cards\n`,
  );
  for (const variant of variants) {
    const row = variant.row;
    console.log(
      `${variant.slug.padEnd(34)} ${variant.name.padEnd(42)} cb ${String(row.cashback_max_pct).padStart(4)}%  fx ${String(row.fx_fee_pct).padStart(5)}%  fee ${String(row.annual_fee_usd)}/${String(row.monthly_fee_usd)}  stake ${String(row.staking_requirement).slice(0, 40)}`,
    );
  }

  if (anomalies.length > 0) {
    console.log("\nData to check before/after the split:");
    for (const anomaly of anomalies) console.log(`  ! ${anomaly}`);
  }

  if (!WRITE) {
    console.log("\nDry run — pass --write to apply.");
    process.exit(0);
  }

  const stamp = new Date().toISOString().slice(0, 10);
  mkdirSync("db/backup", { recursive: true });
  const backupPath = `db/backup/catalog-before-split-${stamp}.json`;
  writeFileSync(
    backupPath,
    `${JSON.stringify({ cards, tiers }, null, 2)}\n`,
  );
  console.log(`\nBackup written to ${backupPath}`);

  writeFileSync(
    `db/import/tier-split-${stamp}.json`,
    `${JSON.stringify(
      parents.map((parent) => ({
        parent_slug: parent.slug,
        parent_name: parent.name,
        variants: variants
          .filter((variant) => variant.parent === parent)
          .map((variant) => ({ slug: variant.slug, name: variant.name })),
      })),
      null,
      2,
    )}\n`,
  );

  await client.query("begin");
  try {
    for (const variant of variants) {
      const values = columns.map((meta) => variant.row[meta.column_name]);
      const bound = columns.map((meta, index) =>
        bind(meta, values[index], index + 1),
      );
      const assignments = columns
        .map((meta, index) => `"${meta.column_name}" = ${bound[index].sql}`)
        .join(", ");

      const result =
        variant.slug === variant.parent.slug
          ? await client.query(
              `update cards set ${assignments} where id = $${columns.length + 1} returning id`,
              [...bound.map((item) => item.value), variant.parent.id],
            )
          : await client.query(
              `insert into cards (${columns.map((meta) => `"${meta.column_name}"`).join(", ")})
               values (${bound.map((item) => item.sql).join(", ")}) returning id`,
              bound.map((item) => item.value),
            );

      const cardId = String(result.rows[0].id);
      const lounge = variant.tier.lounge_visits_per_year;
      if (lounge !== null && lounge !== undefined) {
        await client.query(
          `insert into card_benefits (card_id, benefit_type, title, value_json, source_url, last_verified_at)
           values ($1, 'lounge', 'Airport lounge access', $2::jsonb, $3, $4)`,
          [
            cardId,
            JSON.stringify({ visits: Number(lounge) }),
            variant.parent.source_url ?? null,
            variant.parent.last_verified_at ?? null,
          ],
        );
      }
    }

    for (const parent of parents) {
      await client.query("delete from card_tiers where card_id = $1", [
        parent.id,
      ]);
    }

    await client.query("commit");
    console.log(`\nCreated ${variants.length} cards from ${parents.length} products.`);
    console.log("Run `npm run db:sync` next.");
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
} finally {
  await client.end();
}
