/** One JSON file per namespace in messages/<locale>/<namespace>.json. */
export const namespaces = [
  "common",
  "format",
  "header",
  "footer",
  "newsletter",
  "home",
  "calculator",
  "directory",
  "card",
  "attributes",
  "best",
  "compare",
  "leaderboard",
  "countries",
  "crypto",
  "brands",
  "issuers",
  "methodology",
  "legal",
  "submit",
  "blog",
  "notFound",
  "seo",
] as const;

export type Namespace = (typeof namespaces)[number];

/**
 * Namespaces sent to the browser for client components. Server-only text stays
 * out of the page payload; add a namespace here when a "use client" file reads it.
 */
export const clientNamespaces: Namespace[] = [
  "common",
  "format",
  "header",
  "newsletter",
  "calculator",
  "directory",
  "compare",
  "leaderboard",
  "submit",
];
