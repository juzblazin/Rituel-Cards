import { brandName, cards, cryptoOptions, chainOptions, type Card } from "@/lib/data";

/**
 * Card issuer / programme grouping.
 *
 * Cards are grouped by the leading brand token of their name ("ether.fi" from
 * "ether.fi Cash - Luxe Card", "Crypto.com" from "Crypto.com Visa - Ruby").
 * Tier-split products land in the same group, so a multi-card issuer page reads
 * as a tier ladder ordered cheapest-first.
 */
export type Issuer = {
  slug: string;
  /** Display brand, e.g. "Crypto.com", "KAST". */
  name: string;
  /** Registrable domain shown as the issuer's site, e.g. "crypto.com". */
  domain: string;
  cards: Card[];
  supportedCryptos: string[];
  supportedChains: string[];
  countryCount: number;
  topCard: Card;
};

/** Cases where the first token alone is a poor display name. */
const NAME_OVERRIDES: Record<string, string> = {
  gnosis: "Gnosis Pay",
};

function brandToken(card: Card): string {
  return card.name.split(" - ")[0]?.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function baseDomain(website: string): string {
  const host = website.replace(/^www\./, "").split("/")[0] ?? "";
  const parts = host.split(".");
  return parts.length > 2 ? parts.slice(-2).join(".") : host;
}

function mode(values: string[]): string {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
}

export const issuers: Issuer[] = (() => {
  const groups = new Map<string, Card[]>();
  for (const card of cards) {
    const key = brandToken(card);
    const group = groups.get(key) ?? [];
    group.push(card);
    groups.set(key, group);
  }

  const usedSlugs = new Set<string>();

  return [...groups.entries()]
    .map(([token, group]) => {
      const ordered = [...group].sort(
        (a, b) =>
          a.annualFeeUsd - b.annualFeeUsd ||
          b.cashbackMaxPct - a.cashbackMaxPct ||
          b.ratingScore - a.ratingScore,
      );

      let slug = slugify(token) || "issuer";
      while (usedSlugs.has(slug)) slug = `${slugify(token)}-${slugify(baseDomain(ordered[0].website))}`;
      usedSlugs.add(slug);

      const name = NAME_OVERRIDES[token] ?? mode(ordered.map(brandName));

      const cryptoRank = (symbol: string) =>
        cryptoOptions.findIndex((option) => option.symbol === symbol);
      const chainRank = (name: string) => chainOptions.indexOf(name);

      const supportedCryptos = [...new Set(ordered.flatMap((card) => card.supportedCryptos))].sort(
        (a, b) => (cryptoRank(a) === -1 ? 99 : cryptoRank(a)) - (cryptoRank(b) === -1 ? 99 : cryptoRank(b)),
      );
      const supportedChains = [...new Set(ordered.flatMap((card) => card.supportedChains))].sort(
        (a, b) => (chainRank(a) === -1 ? 99 : chainRank(a)) - (chainRank(b) === -1 ? 99 : chainRank(b)),
      );
      const countryCount = new Set(ordered.flatMap((card) => card.supportedCountries)).size;

      return {
        slug,
        name,
        domain: mode(ordered.map((card) => baseDomain(card.website))),
        cards: ordered,
        supportedCryptos,
        supportedChains,
        countryCount,
        topCard: ordered.reduce((best, card) => (card.ratingScore > best.ratingScore ? card : best)),
      };
    })
    .sort((a, b) => b.cards.length - a.cards.length || a.name.localeCompare(b.name));
})();

export const issuerBySlug = new Map(issuers.map((issuer) => [issuer.slug, issuer]));

const issuerByToken = new Map(
  issuers.map((issuer) => [brandToken(issuer.cards[0]), issuer]),
);

export function issuerForCard(card: Card): Issuer | undefined {
  return issuerByToken.get(brandToken(card));
}
