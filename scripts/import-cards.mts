import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { loadEnv } from "./env.mts";
import { countries } from "../src/lib/countries.ts";

/**
 * Loads `cards.csv` (and optionally `card_tiers.csv`) into the Neon catalog.
 *
 *   npm run db:import                        # db/import/cards.csv + card_tiers.csv
 *   npm run db:import -- --cards my.csv      # a specific file
 *   npm run db:import -- --dry-run           # parse + validate, write nothing
 *   npm run db:import -- --prune             # also delete cards absent from the CSV
 *   npm run db:import -- --dump out.json   # write the parsed rows as JSON
 *
 * Cards are matched on `slug`, so re-running is idempotent and an existing card
 * is updated in place rather than duplicated. Only the columns present in the
 * CSV header are written: columns you leave out of the file keep their current
 * values (and database defaults for new rows), so you can import a 10-column
 * sheet without blanking the other 60.
 *
 * After writing it runs `scripts/sync-cards.mts`, because the site renders from
 * `src/lib/cards.generated.json` and would otherwise serve the previous data.
 *
 * ## Why there is a repair step
 *
 * Spreadsheet exports routinely leave commas unquoted inside free-text cells
 * ("EEA, Switzerland, Australia, LATAM & APAC"), which splits one record across
 * extra fields. Because every column has a known type, the importer can put the
 * record back together: it finds the split where every column's value is valid
 * and shaped like that column, penalising commas that land in typed columns and
 * content that belongs elsewhere (a paragraph in `perks`, a pipe list in
 * `requirements_text`). It reports every merged field so a bad repair is visible
 * rather than silent. `--strict` turns this off and makes a field-count
 * mismatch an error.
 */

/* ------------------------------------------------------------------ */
/* Column types                                                        */
/* ------------------------------------------------------------------ */

type Kind =
  | "text"
  | "slug"
  | "url"
  | "hex"
  | "bool"
  | "number"
  | "int"
  | "date"
  | "list" // text[] split on "|"
  | "codes" // ISO-3166 alpha-2, "|"-separated
  | "wallets" // apple_pay|google_pay|samsung_pay
  | "enum";

type Column = { kind: Kind; allowed?: readonly string[] };

const ENUM = {
  network: ["visa", "mastercard", "unionpay", "other"],
  card_type: ["debit", "credit", "prepaid", "dual_mode"],
  custody_model: ["custodial", "self_custody", "hybrid"],
  kyc_level: ["no_kyc", "light_kyc", "full_kyc"],
  audience: ["personal", "business", "both"],
  reward_asset_type: ["crypto", "stablecoin", "native_token", "stocks_gold"],
} as const;

const COLUMNS: Record<string, Column> = {
  // identity and links
  name: { kind: "text" },
  slug: { kind: "slug" },
  tagline: { kind: "text" },
  affiliate_url: { kind: "url" },
  website: { kind: "text" },
  issuer_bank: { kind: "text" },
  logo_url: { kind: "text" },
  card_image_url: { kind: "text" },

  // card tile
  logo_text: { kind: "text" },
  brand_from: { kind: "hex" },
  brand_to: { kind: "hex" },
  brand_ink: { kind: "hex" },

  // classification
  network: { kind: "enum", allowed: ENUM.network },
  card_type: { kind: "enum", allowed: ENUM.card_type },
  custody_model: { kind: "enum", allowed: ENUM.custody_model },
  audience: { kind: "enum", allowed: ENUM.audience },
  custody_tech: { kind: "text" },
  settlement_chain: { kind: "text" },

  // form factor
  has_virtual: { kind: "bool" },
  has_physical: { kind: "bool" },
  has_metal: { kind: "bool" },
  mobile_wallets: { kind: "wallets" },

  // compliance and geography
  kyc_level: { kind: "enum", allowed: ENUM.kyc_level },
  kyc_notes: { kind: "text" },
  supported_countries: { kind: "codes" },
  excluded_countries: { kind: "codes" },
  regional_scope: { kind: "text" },
  no_kyc_limit_usd: { kind: "number" },

  // costs and fx
  annual_fee_usd: { kind: "number" },
  monthly_fee_usd: { kind: "number" },
  issuance_virtual_fee_usd: { kind: "number" },
  issuance_physical_fee_usd: { kind: "number" },
  topup_fee_pct: { kind: "number" },
  topup_fee_notes: { kind: "text" },
  fx_fee_pct: { kind: "number" },
  fx_fee_notes: { kind: "text" },
  is_gasless: { kind: "bool" },

  // atm
  atm_fee_text: { kind: "text" },
  atm_local_fee_pct: { kind: "number" },
  atm_intl_fee_pct: { kind: "number" },
  atm_monthly_free_allowance_usd: { kind: "number" },
  monthly_atm_limit_usd: { kind: "number" },

  // rewards and yield
  cashback_min_pct: { kind: "number" },
  cashback_max_pct: { kind: "number" },
  reward_asset_type: { kind: "enum", allowed: ENUM.reward_asset_type },
  reward_assets_supported: { kind: "list" },
  balance_yield_apy_pct: { kind: "number" },
  requires_staking: { kind: "bool" },
  staking_token_name: { kind: "text" },
  staking_requirement: { kind: "text" },
  borrowing_min_apr_pct: { kind: "number" },
  payout_token: { kind: "text" },

  // limits
  daily_spend_limit_usd: { kind: "number" },
  monthly_spend_limit_usd: { kind: "number" },
  daily_atm_limit_usd: { kind: "number" },

  // currencies and networks
  supported_cryptos: { kind: "list" },
  supported_chains: { kind: "list" },

  // perks and value-adds
  perks: { kind: "list" },
  has_iban: { kind: "bool" },
  insurance_coverage_usd: { kind: "number" },

  // site display
  rating_score: { kind: "number" },
  review_count: { kind: "int" },
  is_verified: { kind: "bool" },
  is_sponsored: { kind: "bool" },
  sponsor_priority: { kind: "int" },

  // editorial
  launched_at: { kind: "date" },
  description: { kind: "text" },
  pros: { kind: "list" },
  cons: { kind: "list" },
  requirements_text: { kind: "text" },
};

const COUNTRY_CODES = new Set(countries.map((country) => country.code));
const WALLET_VALUES = new Set(["apple_pay", "google_pay", "samsung_pay"]);

/* ------------------------------------------------------------------ */
/* CSV parsing                                                         */
/* ------------------------------------------------------------------ */

/** RFC 4180 parser: handles quoted fields, doubled quotes, CRLF and a BOM. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let start = 0;
  if (text.charCodeAt(0) === 0xfeff) start = 1;

  for (let i = start; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
}

/* ------------------------------------------------------------------ */
/* Validation and coercion                                             */
/* ------------------------------------------------------------------ */

const isBlank = (value: string) => value.trim() === "";

/** Whether `value` is acceptable for `column`. Used by both repair and import. */
function isValid(column: Column, value: string, loose = false): boolean {
  if (isBlank(value)) return true;
  const trimmed = value.trim();
  switch (column.kind) {
    case "slug":
      return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed);
    case "url":
      return /^https?:\/\/\S+$/.test(trimmed);
    case "hex":
      return /^#[0-9a-fA-F]{6}$/.test(trimmed);
    case "bool":
      return /^(true|false)$/i.test(trimmed);
    case "number":
      return /^-?\d+(?:\.\d+)?$/.test(trimmed);
    case "int":
      return /^-?\d+$/.test(trimmed);
    case "date":
      return /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
    case "enum":
      return (column.allowed ?? []).includes(trimmed);
    case "codes":
      return trimmed.split("|").every((part) => /^[A-Z]{2}$/.test(part.trim()));
    case "wallets":
      return trimmed.split("|").every((part) => WALLET_VALUES.has(part.trim()));
    case "list":
      if (!loose) {
        // A real list has a separator; this is what stops a description from
        // being swallowed by `pros` during a repair.
        if (!trimmed.includes("|")) return false;
      }
      return trimmed.split("|").every((part) => part.trim() !== "");
    default:
      return true;
  }
}

/** Converts one CSV cell into the value the driver should store. */
function coerce(column: Column, value: string, warn: (message: string) => void): unknown {
  if (isBlank(value)) return null;
  const trimmed = value.trim();
  switch (column.kind) {
    case "bool":
      return trimmed.toLowerCase() === "true";
    case "number":
    case "int":
      return Number(trimmed);
    case "list":
      return trimmed
        .split("|")
        .map((part) => part.trim())
        .filter((part) => part !== "");
    case "codes": {
      const codes = trimmed
        .split("|")
        .map((part) => part.trim().toUpperCase())
        .filter((part) => part !== "");
      const unknown = codes.filter((code) => !COUNTRY_CODES.has(code));
      if (unknown.length > 0) {
        warn(`unknown country code(s) ${unknown.join(", ")} — no country page will be generated`);
      }
      return codes.filter((code) => COUNTRY_CODES.has(code));
    }
    case "wallets": {
      const wallets = trimmed
        .split("|")
        .map((part) => part.trim())
        .filter((part) => part !== "");
      const unknown = wallets.filter((wallet) => !WALLET_VALUES.has(wallet));
      if (unknown.length > 0) {
        warn(`unknown mobile wallet(s) ${unknown.join(", ")} — the UI will ignore them`);
      }
      return wallets.filter((wallet) => WALLET_VALUES.has(wallet));
    }
    case "enum":
      return trimmed;
    default:
      return trimmed;
  }
}

/* ------------------------------------------------------------------ */
/* Repair of rows with unquoted commas                                 */
/* ------------------------------------------------------------------ */

/**
 * Typed columns are expensive to split, so a stray comma lands in a free-text
 * column such as `regional_scope` rather than in `annual_fee_usd`.
 */
function splitWeight(column: Column): number {
  switch (column.kind) {
    case "text":
    case "list":
      return 1;
    default:
      return 8;
  }
}

/** Columns whose value is a `|`-separated list of short bullet points. */
const BULLETS = new Set(["pros", "cons", "perks"]);

/**
 * How long a value is allowed to be before it is probably the wrong column.
 * Only used by the repair, as a soft signal — nothing here rejects a row.
 */
const TEXT_CAP: Record<string, number> = {
  name: 60,
  tagline: 150,
  website: 60,
  issuer_bank: 60,
  logo_text: 8,
  payout_token: 14,
  regional_scope: 80,
  topup_fee_notes: 110,
  fx_fee_notes: 130,
  atm_fee_text: 120,
  staking_requirement: 150,
  requirements_text: 100,
};

/**
 * Cost of treating the commas between tokens `i..k` as punctuation rather than
 * as field separators.
 *
 * Exports that leave prose commas unquoted still put a space after them
 * ("EEA, Switzerland"), while a field separator is followed immediately by the
 * next value ("…,&lt;field&gt;"). That difference is what makes the repair exact
 * instead of a guess: joining across a boundary with no leading space is almost
 * always a mistake, and costs far more than any shape penalty below.
 */
function proseCost(tokens: string[], i: number, k: number): number {
  let cost = 0;
  for (let index = i + 1; index <= k; index++) {
    if (!isProseComma(tokens[index - 1] ?? "", tokens[index] ?? "")) cost += 40;
  }
  return cost;
}

/**
 * A comma is punctuation when the next value is indented ("EEA, Switzerland")
 * or when it is a thousands separator ("$2,500"). Everything else is a field
 * boundary.
 */
function isProseComma(previous: string, next: string): boolean {
  if (/^\s/.test(next)) return true;
  return /\d$/.test(previous) && /^\d{3}(?!\d)/.test(next);
}

/**
 * Cost of putting `value` in `name`.
 *
 * The number of commas in a record is fixed, so every candidate split merges
 * the same total number of tokens. Without shape scoring the chooser is blind
 * between "commas in `regional_scope`" and "commas in `perks`", and picks
 * whichever it reaches first — which shifted whole tails one column left. These
 * penalties encode what each column actually looks like.
 */
function shapeCost(name: string, column: Column, value: string): number {
  const length = value.length;
  const hasPipe = value.includes("|");
  let cost = 0;

  if (BULLETS.has(name)) {
    const items = value.split("|").map((item) => item.trim());
    if (!hasPipe) cost += 8; // a list has separators
    if (items.length > 4) cost += 3 * (items.length - 4);
    for (const item of items) {
      if (item.length > 170) cost += 5; // a paragraph, i.e. description text
      if (item.endsWith(".")) cost += 8; // prose, not a bullet
      if (item.includes(". ")) cost += 5; // two sentences in one bullet
      if (/^[a-z]/.test(item)) cost += 2; // a bullet starts with a capital
    }
  } else if (hasPipe) {
    cost += 50; // only the bullets and the list columns hold pipes
  }

  if (name === "description") {
    // A description is prose: it ends a sentence. This is the signal that keeps
    // the tail of a paragraph from being absorbed by the first `pros` bullet.
    if (!/[.!?]$/.test(value.trim())) cost += 12;
  }

  if (column.kind === "list" && !BULLETS.has(name)) {
    for (const item of value.split("|")) {
      if (item.trim().length > 40) cost += 3;
    }
  }

  if (column.kind === "text") {
    const cap = TEXT_CAP[name] ?? 400;
    if (length > cap) cost += Math.min(6, 1 + Math.floor((length - cap) / 80));
    if (name === "description" && length < 150) cost += 4;
  }

  return cost;
}

/**
 * Assigns every token of `tokens` to exactly one column, in order, so that each
 * column's value validates. Returns the reconstructed cells plus, per column,
 * how many extra tokens it absorbed.
 */
function alignRow(
  tokens: string[],
  headers: string[],
  loose: boolean,
): { cells: string[]; merges: number[] } | null {
  const n = headers.length;
  const m = tokens.length;
  if (m < n) return null;

  const cost: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(Infinity));
  const take: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(-1));
  cost[m][n] = 0;

  for (let j = n - 1; j >= 0; j--) {
    const column = COLUMNS[headers[j]];
    const weight = splitWeight(column);
    for (let i = m - 1; i >= 0; i--) {
      // Leave at least one token for each column still to come.
      const limit = m - (n - j);
      for (let k = i; k <= limit; k++) {
        const rest = cost[k + 1][j + 1];
        if (rest === Infinity) continue;
        // Tokens keep their own leading space, so a plain comma rebuilds the
        // original text byte for byte.
        const value = tokens.slice(i, k + 1).join(",");
        if (!isValid(column, value, loose)) continue;
        const total =
          (k - i) * weight + proseCost(tokens, i, k) + shapeCost(headers[j], column, value) + rest;
        if (total < cost[i][j]) {
          cost[i][j] = total;
          take[i][j] = k;
        }
      }
    }
  }

  if (cost[0][0] === Infinity) return null;

  const cells: string[] = [];
  const merges: number[] = [];
  let i = 0;
  for (let j = 0; j < n; j++) {
    const k = take[i][j];
    cells.push(tokens.slice(i, k + 1).join(","));
    merges.push(k - i);
    i = k + 1;
  }
  return { cells, merges };
}

/* ------------------------------------------------------------------ */
/* Argument parsing                                                    */
/* ------------------------------------------------------------------ */

const args = process.argv.slice(2);
const has = (flag: string) => args.includes(flag);
const argValue = (flag: string, fallback: string) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const cardsPath = argValue("--cards", "db/import/cards.csv");
const tiersPath = argValue("--tiers", "db/import/card_tiers.csv");
const dryRun = has("--dry-run");
const strict = has("--strict");
const prune = has("--prune");
const skipSync = has("--no-sync");

/* ------------------------------------------------------------------ */
/* Parse                                                               */
/* ------------------------------------------------------------------ */

if (!existsSync(cardsPath)) {
  console.error(`db:import — no file at ${cardsPath}.`);
  console.error("Pass one with `npm run db:import -- --cards path/to/cards.csv`.");
  process.exit(1);
}

const [header, ...rawRows] = parseCsv(readFileSync(cardsPath, "utf8"));
const headers = header.map((name) => name.trim());

const unknownHeaders = headers.filter((name) => !COLUMNS[name]);
if (unknownHeaders.length > 0) {
  console.error(`db:import — unknown column(s) in ${cardsPath}: ${unknownHeaders.join(", ")}`);
  console.error("Compare against db/cards-schema.sql for the exact column names.");
  process.exit(1);
}

const duplicatesInHeader = headers.filter((name, index) => headers.indexOf(name) !== index);
if (duplicatesInHeader.length > 0) {
  console.error(`db:import — duplicated column(s) in header: ${duplicatesInHeader.join(", ")}`);
  process.exit(1);
}

type ParsedCard = {
  row: number;
  values: Record<string, unknown>;
  slug: string;
  warnings: string[];
  repaired?: string[];
};

const cards: ParsedCard[] = [];
const problems: string[] = [];
const seenSlugs = new Map<string, number>();

for (const [index, raw] of rawRows.entries()) {
  const rowNumber = index + 2; // header is line 1
  const warnings: string[] = [];
  let cells: string[];
  let repaired: string[] | undefined;

  if (raw.length === headers.length) {
    cells = raw;
  } else if (strict) {
    problems.push(`row ${rowNumber}: ${raw.length} fields, expected ${headers.length} — quote cells containing commas`);
    continue;
  } else {
    const attempt = alignRow(raw, headers, false) ?? alignRow(raw, headers, true);
    if (!attempt) {
      problems.push(
        `row ${rowNumber}: ${raw.length} fields, expected ${headers.length} — could not infer which cells contain commas`,
      );
      continue;
    }
    cells = attempt.cells;
    repaired = headers
      .map((name, column) => (attempt.merges[column] > 0 ? `${name} (+${attempt.merges[column]} comma)` : ""))
      .filter((entry) => entry !== "");
  }

  const values: Record<string, unknown> = {};
  const invalid: string[] = [];
  headers.forEach((name, column) => {
    const cell = cells[column] ?? "";
    const spec = COLUMNS[name];
    if (!isValid(spec, cell, true)) {
      invalid.push(`${name}="${cell.trim().slice(0, 40)}"`);
      return;
    }
    values[name] = coerce(spec, cell, (message) => warnings.push(message));
  });

  if (invalid.length > 0) {
    problems.push(`row ${rowNumber}: invalid value for ${invalid.join(", ")}`);
    continue;
  }

  const slug = String(values.slug ?? "");
  if (!slug) {
    problems.push(`row ${rowNumber}: no slug`);
    continue;
  }
  const previous = seenSlugs.get(slug);
  if (previous) {
    problems.push(`row ${rowNumber}: slug "${slug}" already used on row ${previous}`);
    continue;
  }
  seenSlugs.set(slug, rowNumber);

  if (typeof values.cashback_min_pct === "number" && typeof values.cashback_max_pct === "number") {
    if (values.cashback_max_pct < values.cashback_min_pct) {
      warnings.push(
        `cashback_max_pct (${values.cashback_max_pct}) is below cashback_min_pct (${values.cashback_min_pct})`,
      );
    }
  }
  if (typeof values.rating_score === "number" && (values.rating_score < 0 || values.rating_score > 10)) {
    warnings.push(`rating_score ${values.rating_score} is outside 0–10`);
  }

  cards.push({ row: rowNumber, values, slug, warnings, repaired });
}

console.log(`db:import — ${cardsPath}: ${rawRows.length} rows, ${cards.length} parsed.`);

const repairedRows = cards.filter((card) => card.repaired && card.repaired.length > 0);
if (repairedRows.length > 0) {
  console.log(`db:import — repaired unquoted commas in ${repairedRows.length} row(s) (quote those cells to silence this):`);
  for (const card of repairedRows.slice(0, 5)) {
    console.log(`  row ${card.row} ${card.slug}: ${card.repaired!.join(", ")}`);
  }
  if (repairedRows.length > 5) console.log(`  … and ${repairedRows.length - 5} more`);
}

for (const card of cards) {
  for (const warning of card.warnings) {
    console.warn(`  ! row ${card.row} ${card.slug}: ${warning}`);
  }
}

if (problems.length > 0) {
  console.error(`db:import — ${problems.length} row(s) could not be read:`);
  for (const problem of problems.slice(0, 25)) console.error(`  ${problem}`);
  if (problems.length > 25) console.error(`  … and ${problems.length - 25} more`);
  // A partial import is worse than none: the missing rows look like deletions.
  console.error("db:import — nothing was written. Fix the rows above and run again.");
  process.exit(1);
}

if (cards.length === 0) {
  console.error("db:import — nothing to import.");
  process.exit(1);
}

if (has("--dump")) {
  // Writes a file rather than stdout: a 50-card dump is far larger than a
  // terminal buffer, and truncating it mid-string is worse than not seeing it.
  const dumpPath = argValue("--dump", "db/import/parsed.json");
  writeFileSync(dumpPath, `${JSON.stringify(cards, null, 2)}\n`);
  console.log(`db:import — wrote the parsed rows to ${dumpPath}.`);
  process.exit(0);
}

/* ------------------------------------------------------------------ */
/* Tiers                                                               */
/* ------------------------------------------------------------------ */

type ParsedTier = { row: number; slug: string; values: Record<string, unknown> };

const tiers: ParsedTier[] = [];
if (existsSync(tiersPath)) {
  const [tierHeader, ...tierRows] = parseCsv(readFileSync(tiersPath, "utf8"));
  const tierHeaders = tierHeader.map((name) => name.trim());
  const tierColumns: Record<string, Column> = {
    card_slug: { kind: "slug" },
    tier_name: { kind: "text" },
    tier_order: { kind: "int" },
    annual_fee_usd: { kind: "number" },
    monthly_fee_usd: { kind: "number" },
    stake_or_portfolio_req: { kind: "text" },
    cashback_pct: { kind: "number" },
    fx_fee_pct: { kind: "number" },
    balance_yield_apy_pct: { kind: "number" },
    atm_free_allowance_usd: { kind: "number" },
    atm_fee_notes: { kind: "text" },
    daily_spend_limit_usd: { kind: "number" },
    tier_perks: { kind: "list" },
  };

  for (const name of tierHeaders) {
    if (!tierColumns[name]) {
      console.error(`db:import — unknown column "${name}" in ${tiersPath}.`);
      console.error(`  allowed: ${Object.keys(tierColumns).join(", ")}`);
      process.exit(1);
    }
  }

  for (const [index, raw] of tierRows.entries()) {
    const values: Record<string, unknown> = {};
    tierHeaders.forEach((name, column) => {
      const cell = raw[column] ?? "";
      values[name] = isBlank(cell) ? null : coerce(tierColumns[name], cell, () => {});
    });
    const slug = String(values.card_slug ?? "");
    if (!slug || !values.tier_name) {
      console.warn(`  ! ${tiersPath} row ${index + 2}: needs card_slug and tier_name — skipped`);
      continue;
    }
    delete values.card_slug;
    tiers.push({ row: index + 2, slug, values });
  }
  console.log(`db:import — ${tiersPath}: ${tiers.length} tier row(s).`);
} else {
  console.log(`db:import — no ${tiersPath}, leaving existing tiers untouched.`);
}

/* ------------------------------------------------------------------ */
/* Write                                                               */
/* ------------------------------------------------------------------ */

const url = loadEnv();
if (!url) {
  console.error("db:import — no DATABASE_URL in .env.local or .env.");
  process.exit(1);
}

const host = new URL(url).host;
console.log(`db:import — target ${host}${dryRun ? " (dry run, nothing written)" : ""}`);

if (!dryRun) {
  const sql = neon(url);
  let inserted = 0;
  let updated = 0;

  for (const card of cards) {
    const columns = Object.keys(card.values);
    const params = columns.map((column) => card.values[column]);
    const placeholders = columns.map((_, index) => `$${index + 1}`);

    const existing = (await sql.query("select id from cards where slug = $1", [card.slug])) as { id: string }[];

    const statement = `
      insert into cards (${columns.join(", ")})
      values (${placeholders.join(", ")})
      on conflict (slug) do update set
        ${columns
          .filter((column) => column !== "slug")
          .map((column) => `${column} = excluded.${column}`)
          .join(",\n        ")},
        updated_at = now()
      returning id
    `;

    const written = (await sql.query(statement, params)) as { id: string }[];
    if (existing.length > 0) updated += 1;
    else inserted += 1;

    const cardId = written[0]?.id;
    if (!cardId) continue;

    const mine = tiers.filter((tier) => tier.slug === card.slug);
    if (mine.length > 0) {
      await sql.query("delete from card_tiers where card_id = $1", [cardId]);
      for (const [order, tier] of mine.entries()) {
        const tierColumns = Object.keys(tier.values);
        const tierParams = [cardId, ...tierColumns.map((column) => tier.values[column])];
        if (!tierColumns.includes("tier_order")) {
          tierColumns.push("tier_order");
          tierParams.push(order + 1);
        }
        await sql.query(
          `insert into card_tiers (card_id, ${tierColumns.join(", ")})
           values ($1, ${tierColumns.map((_, index) => `$${index + 2}`).join(", ")})`,
          tierParams,
        );
      }
    }
  }

  // A tier row naming a slug that is not in the CSV cannot be attached.
  const missingTierCards = [...new Set(tiers.map((tier) => tier.slug))].filter(
    (slug) => !seenSlugs.has(slug),
  );
  if (missingTierCards.length > 0) {
    console.warn(`db:import — tiers skipped for unknown card slug(s): ${missingTierCards.join(", ")}`);
  }

  if (prune) {
    const imported = cards.map((card) => card.slug);
    const removed = (await sql.query("delete from cards where not (slug = any($1)) returning slug", [
      imported,
    ])) as { slug: string }[];
    console.log(`db:import — pruned ${removed.length} card(s) absent from the CSV.`);
    if (removed.length > 0) console.log(`  ${removed.map((row) => row.slug).join(", ")}`);
  } else {
    const orphans = (await sql.query(
      "select slug from cards where not (slug = any($1)) order by slug",
      [cards.map((card) => card.slug)],
    )) as { slug: string }[];
    if (orphans.length > 0) {
      console.log(
        `db:import — ${orphans.length} card(s) in the database are not in this CSV and were left alone:`,
      );
      console.log(`  ${orphans.map((row) => row.slug).join(", ")}`);
      console.log("  Run with --prune to delete them.");
    }
  }

  console.log(`db:import — ${inserted} inserted, ${updated} updated.`);
}

if (dryRun || skipSync) {
  console.log("db:import — skipped sync.");
} else {
  console.log("db:import — syncing snapshot…");
  execFileSync(
    process.execPath,
    ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "scripts/sync-cards.mts"],
    { stdio: "inherit" },
  );
}
