export const site = {
  name: "RItuel",
  wordmark: "rituel",
  tagline: "Find the crypto card that actually pays you.",
  description:
    "Compare 24 crypto debit, credit and prepaid cards on real fees, cashback, KYC and country availability. Independent data, zero fluff.",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000",
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
