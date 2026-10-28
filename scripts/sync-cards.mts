import { writeFileSync } from "node:fs";
import { loadEnv } from "./env.mts";
import { fetchCards } from "../src/lib/cards-db.ts";

/**
 * Snapshots the Neon catalog into `src/lib/cards.generated.json`.
 *
 *   npm run db:sync
 *
 * The directory pre-renders its pages, so it reads cards synchronously from a
 * committed snapshot rather than querying per request. Postgres is the source of
 * truth: edit a row, run this, rebuild. `npm run build` runs it via `prebuild`,
 * so a deploy always ships the current table.
 *
 * With no `DATABASE_URL` the existing snapshot is left alone and the script
 * exits 0, which keeps offline builds working. An empty table is treated the
 * same way: blanking a working site is worse than a stale snapshot.
 */

const TARGET = "src/lib/cards.generated.json";

const url = loadEnv();
if (!url) {
  console.warn("db:sync — no DATABASE_URL set, keeping the existing snapshot.");
  process.exit(0);
}

const cards = await fetchCards(url);

if (cards.length === 0) {
  console.warn("db:sync — cards table is empty, keeping the existing snapshot.");
  process.exit(0);
}

writeFileSync(TARGET, `${JSON.stringify(cards, null, 2)}\n`);
console.log(`db:sync — wrote ${cards.length} cards to ${TARGET}.`);
