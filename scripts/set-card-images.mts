import { existsSync, readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { loadEnv } from "./env.mts";

/**
 * Applies `db/card-images.json` (slug -> public path) to `cards.card_image_url`.
 *
 *   npm run db:card-images            # dry run: print the diff
 *   npm run db:card-images -- --write # apply
 *   npm run db:sync                   # refresh the app snapshot afterwards
 *
 * The file is declarative: a card missing from it is cleared, so removing an
 * entry reverts that tile to the generated artwork. Paths are checked against
 * `public/` before anything is written.
 */

const WRITE = process.argv.includes("--write");

const url = loadEnv();
if (!url) {
  console.error("No DATABASE_URL found in .env.local or .env — nothing to write.");
  process.exit(1);
}

const wanted = JSON.parse(readFileSync("db/card-images.json", "utf8")) as Record<string, string>;

for (const [slug, path] of Object.entries(wanted)) {
  if (!path.startsWith("/")) throw new Error(`${slug}: path must be site-relative: ${path}`);
  if (!existsSync(`public${path}`)) throw new Error(`${slug}: ${path} does not exist under public/`);
}

const sql = neon(url);

type Row = { slug: string; name: string; card_image_url: string | null };
const rows = (await sql`select slug, name, card_image_url from cards`) as Row[];
const bySlug = new Map(rows.map((row) => [row.slug, row]));

const unknown = Object.keys(wanted).filter((slug) => !bySlug.has(slug));
const changed = Object.entries(wanted).filter(
  ([slug, path]) => bySlug.get(slug)?.card_image_url !== path,
);
const cleared = rows.filter((row) => row.card_image_url && !(row.slug in wanted));

console.log(`card-images — ${Object.keys(wanted).length} mapped, ${rows.length} cards in db`);
if (unknown.length) console.log(`  unknown slugs: ${unknown.join(", ")}`);
for (const [slug, path] of changed) console.log(`  set   ${slug} -> ${path}`);
for (const row of cleared) console.log(`  clear ${row.slug} (was ${row.card_image_url})`);
if (!changed.length && !cleared.length) console.log("  already in sync.");

if (!WRITE) {
  console.log("\ndry run — pass --write to apply.");
  process.exit(0);
}

for (const [slug, path] of changed) {
  await sql`update cards set card_image_url = ${path}, updated_at = now() where slug = ${slug}`;
}
for (const row of cleared) {
  await sql`update cards set card_image_url = null, updated_at = now() where slug = ${row.slug}`;
}
console.log(`\napplied ${changed.length} set, ${cleared.length} cleared.`);
