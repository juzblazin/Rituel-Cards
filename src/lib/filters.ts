import type { Card, CardType, CustodyModel, KycLevel, MobileWallet } from "./data";

export type KycFilter = "all" | "no_kyc" | "light_kyc" | "full_kyc";
export type CustodyFilter = "all" | "self" | "custodial";
export type AudienceFilter = "all" | "personal" | "business";
export type FormFilter = "all" | "virtual" | "physical";
export type FundingFilter = "all" | "debit" | "credit";
export type SortKey = "featured" | "rating" | "cashback" | "fx" | "annual" | "newest";
export type ViewMode = "grid" | "table";

export type Filters = {
  q: string;
  kyc: KycFilter;
  custody: CustodyFilter;
  audience: AudienceFilter;
  country: string;
  minRating: number;
  wallets: MobileWallet[];
  form: FormFilter;
  funding: FundingFilter;
  cryptos: string[];
  chains: string[];
  sort: SortKey;
};

export const defaultFilters: Filters = {
  q: "",
  kyc: "all",
  custody: "all",
  audience: "all",
  country: "ALL",
  minRating: 0,
  wallets: [],
  form: "all",
  funding: "all",
  cryptos: [],
  chains: [],
  sort: "featured",
};

const SORTS: SortKey[] = ["featured", "rating", "cashback", "fx", "annual", "newest"];

function one(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function list(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value.join(",") : value ?? "";
  return raw.split(",").map((v) => v.trim()).filter(Boolean);
}

export function parseFilters(params: Record<string, string | string[] | undefined>): Filters {
  const kyc = one(params.kyc);
  const custody = one(params.custody);
  const audience = one(params.audience);
  const form = one(params.form);
  const funding = one(params.funding);
  const sort = one(params.sort) as SortKey;
  const minRating = Number(one(params.rating));
  const wallets = list(params.wallet).filter((w): w is MobileWallet =>
    ["apple_pay", "google_pay", "samsung_pay"].includes(w),
  );

  return {
    q: one(params.q).slice(0, 80),
    kyc: (["all", "no_kyc", "light_kyc", "full_kyc"] as KycFilter[]).includes(kyc as KycFilter)
      ? (kyc as KycFilter)
      : "all",
    custody: (["all", "self", "custodial"] as CustodyFilter[]).includes(custody as CustodyFilter)
      ? (custody as CustodyFilter)
      : "all",
    audience: (["all", "personal", "business"] as AudienceFilter[]).includes(audience as AudienceFilter)
      ? (audience as AudienceFilter)
      : "all",
    country: /^[A-Z]{2}$/.test(one(params.country)) ? one(params.country) : "ALL",
    minRating: [0, 5, 7, 8].includes(minRating) ? minRating : 0,
    wallets,
    form: (["all", "virtual", "physical"] as FormFilter[]).includes(form as FormFilter)
      ? (form as FormFilter)
      : "all",
    funding: (["all", "debit", "credit"] as FundingFilter[]).includes(funding as FundingFilter)
      ? (funding as FundingFilter)
      : "all",
    cryptos: list(params.crypto).map((c) => c.toUpperCase()),
    chains: list(params.chain),
    sort: SORTS.includes(sort) ? sort : "featured",
  };
}

export function filtersToQuery(filters: Filters): string {
  const sp = new URLSearchParams();
  if (filters.q) sp.set("q", filters.q);
  if (filters.kyc !== "all") sp.set("kyc", filters.kyc);
  if (filters.custody !== "all") sp.set("custody", filters.custody);
  if (filters.audience !== "all") sp.set("audience", filters.audience);
  if (filters.country !== "ALL") sp.set("country", filters.country);
  if (filters.minRating > 0) sp.set("rating", String(filters.minRating));
  if (filters.wallets.length) sp.set("wallet", filters.wallets.join(","));
  if (filters.form !== "all") sp.set("form", filters.form);
  if (filters.funding !== "all") sp.set("funding", filters.funding);
  if (filters.cryptos.length) sp.set("crypto", filters.cryptos.join(","));
  if (filters.chains.length) sp.set("chain", filters.chains.join(","));
  if (filters.sort !== "featured") sp.set("sort", filters.sort);
  return sp.toString();
}

export function activeFilterCount(filters: Filters): number {
  let count = 0;
  if (filters.q) count++;
  if (filters.kyc !== "all") count++;
  if (filters.custody !== "all") count++;
  if (filters.audience !== "all") count++;
  if (filters.country !== "ALL") count++;
  if (filters.minRating > 0) count++;
  count += filters.wallets.length;
  if (filters.form !== "all") count++;
  if (filters.funding !== "all") count++;
  count += filters.cryptos.length;
  count += filters.chains.length;
  return count;
}

export function matchesFilters(card: Card, filters: Filters): boolean {
  if (filters.q) {
    const haystack = [
      card.name,
      card.issuerName,
      card.tagline,
      ...card.supportedCryptos,
      ...card.supportedChains,
      card.regionLabel,
    ]
      .join(" ")
      .toLowerCase();
    const terms = filters.q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.every((term) => haystack.includes(term))) return false;
  }

  if (filters.kyc !== "all" && card.kycLevel !== (filters.kyc as KycLevel)) return false;

  if (filters.custody === "self" && card.custodyModel !== "self_custody") return false;
  if (
    filters.custody === "custodial" &&
    card.custodyModel !== "custodial" &&
    card.custodyModel !== "hybrid"
  ) {
    return false;
  }

  if (filters.audience !== "all" && card.audience !== filters.audience && card.audience !== "both") {
    return false;
  }

  if (filters.country !== "ALL" && !card.supportedCountries.includes(filters.country)) return false;

  if (filters.minRating > 0 && card.ratingScore < filters.minRating) return false;

  if (filters.wallets.length && !filters.wallets.every((w) => card.mobileWallets.includes(w))) {
    return false;
  }

  if (filters.form === "virtual" && !card.hasVirtual) return false;
  if (filters.form === "physical" && !card.hasPhysical) return false;

  const isCredit = card.cardType === ("credit" satisfies CardType);
  if (filters.funding === "credit" && !isCredit) return false;
  if (filters.funding === "debit" && isCredit) return false;

  if (filters.cryptos.length && !filters.cryptos.every((c) => card.supportedCryptos.includes(c))) {
    return false;
  }

  if (filters.chains.length && !filters.chains.every((c) => card.supportedChains.includes(c))) {
    return false;
  }

  return true;
}

function sortValue(card: Card, sort: SortKey): number {
  switch (sort) {
    case "rating":
      return card.ratingScore;
    case "cashback":
      return card.cashbackMaxPct;
    case "fx":
      return card.fxFeePct;
    case "annual":
      return card.annualFeeUsd;
    case "newest":
      return new Date(card.launchedAt).getTime() / 1e12;
    default:
      return card.ratingScore;
  }
}

export function sortCards(list: Card[], sort: SortKey): Card[] {
  return [...list].sort((a, b) => {
    if (a.isSponsored !== b.isSponsored) return a.isSponsored ? -1 : 1;
    if (a.isSponsored && b.isSponsored) return a.sponsorPriority - b.sponsorPriority;
    const av = sortValue(a, sort);
    const bv = sortValue(b, sort);
    const ascending = sort === "fx" || sort === "annual";
    if (av !== bv) return ascending ? av - bv : bv - av;
    return b.ratingScore - a.ratingScore;
  });
}

export function filterAndSort(list: Card[], filters: Filters): Card[] {
  return sortCards(list.filter((card) => matchesFilters(card, filters)), filters.sort);
}

export function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function custodyMatches(card: Card, filter: CustodyFilter): boolean {
  if (filter === "self") return card.custodyModel === "self_custody";
  if (filter === "custodial") return card.custodyModel !== "self_custody";
  return true;
}

export type { CardType, CustodyModel, KycLevel, MobileWallet };
