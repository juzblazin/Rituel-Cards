/**
 * Absolute origin used for canonicals, Open Graph URLs, the sitemap and affiliate
 * tags. A missing env var must never fall back to localhost in production.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
  (process.env.NODE_ENV === "production" ? "https://rituel.xyz" : "http://localhost:3000");

export const site = {
  name: "RItuel",
  wordmark: "rituel",
  tagline: "Find the crypto card that actually pays you.",
  description:
    "Compare 24 crypto debit, credit and prepaid cards on real fees, cashback, KYC and country availability. Independent data, zero fluff.",
  url: siteUrl,
  email: "hello@rituel.xyz",
  twitter: "@rituel",
};

export function absoluteUrl(path = "/"): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function affiliateUrl(slug: string): string {
  return `/go/${slug}`;
}

export const gaMeasurementId = process.env.NEXT_PUBLIC_GA_ID || "";
