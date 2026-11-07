/**
 * Central URL builders. Internal links should use these so the URL scheme
 * lives in exactly one place.
 */

export const cardPath = (slug: string) => `/cards/${slug}`;

export const bestPath = (slug: string) => `/best/${slug}`;

export const useCasePath = (slug: string) => `/use-cases/${slug}`;

export const tokenPath = (slug: string) => `/tokens/${slug}`;

export const chainPath = (slug: string) => `/chains/${slug}`;

/** Token or chain page, routed by the page's kind. */
export const cryptoPath = (page: { slug: string; kind: "token" | "chain" }) =>
  page.kind === "token" ? tokenPath(page.slug) : chainPath(page.slug);
