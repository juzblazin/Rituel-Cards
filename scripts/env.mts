import { existsSync, readFileSync } from "node:fs";

/**
 * Loads DATABASE_URL for the standalone `db:*` scripts.
 *
 * Next.js loads `.env.local` for the app; these scripts run outside it, so they
 * read the same files themselves. Existing `process.env` values win, which is
 * what lets CI or a host inject the connection string instead.
 */
export function loadEnv(files = [".env.local", ".env"]): string {
  for (const file of files) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      if (process.env[key]) continue;
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
  return process.env.DATABASE_URL?.trim() || "";
}
