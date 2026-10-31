import cardsFromDb from "./cards.generated.json";

export type Network = "visa" | "mastercard" | "unionpay";
export type CardType = "debit" | "credit" | "prepaid";
export type CustodyModel = "self_custody" | "custodial" | "hybrid";
export type Audience = "personal" | "business" | "both";
export type KycLevel = "no_kyc" | "light_kyc" | "full_kyc";
export type MobileWallet = "apple_pay" | "google_pay" | "samsung_pay";

export type CardBenefit = {
  type: string;
  title: string;
  value: Record<string, unknown>;
  details: string;
  sourceUrl: string;
};

export type CardTier = {
  name: string;
  stake: string;
  cashbackPct: number;
  annualFeeUsd: number;
  fxFeePct: number;
  perks: string[];
  monthlyFeeUsd?: number;
  atmFreeAllowanceUsd?: number;
  cashbackCapMonthlyUsd?: number | null;
  travelRewardPct?: number;
  atmMonthlyCapUsd?: number | null;
  topupCapMonthlyUsd?: number | null;
  loungeVisitsPerYear?: number | null;
  benefits?: CardBenefit[];
};

export type Card = {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  /** Short monogram shown in the generated card tile, e.g. "e" or "CDC". */
  logoText: string;
  brand: { from: string; to: string; ink: string };
  affiliateUrl: string;
  website: string;
  issuerName: string;
  network: Network;
  cardType: CardType;
  custodyModel: CustodyModel;
  audience: Audience;
  hasVirtual: boolean;
  hasPhysical: boolean;
  kycLevel: KycLevel;
  noKycLimitUsd: number;
  cashbackMinPct: number;
  cashbackMaxPct: number;
  issuanceFeeUsd: number;
  annualFeeUsd: number;
  monthlyFeeUsd: number;
  topupFeePct: number;
  topupFeeNotes: string;
  fxFeePct: number;
  fxFeeNotes: string;
  atmFeePct: number;
  atmFeeNote: string;
  maxDailySpendUsd: number;
  monthlyAtmLimitUsd: number;
  payoutToken: string;
  stakingRequirement: string;
  perks: string[];
  requirementsText: string;
  supportedCryptos: string[];
  supportedChains: string[];
  mobileWallets: MobileWallet[];
  supportedCountries: string[];
  regionLabel: string;
  ratingScore: number;
  reviewCount: number;
  isVerified: boolean;
  isSponsored: boolean;
  sponsorPriority: number;
  launchedAt: string;
  description: string;
  pros: string[];
  cons: string[];
  tiers: CardTier[];

  // v2 — optional so the snapshot keeps type-checking before `db:sync` runs.
  status?: "live" | "waitlist" | "beta" | "paused" | "discontinued";
  sourceUrl?: string;
  lastVerifiedAt?: string;
  hasMetal?: boolean;
  monthlySpendLimitUsd?: number | null;
  dailyAtmLimitUsd?: number | null;
  balanceYieldApyPct?: number;
  insuranceCoverageUsd?: number;
  hasIban?: boolean;
  cashbackCapMonthlyUsd?: number | null;
  rewardCategories?: {
    category?: string;
    pct?: number;
    capUsd?: number | null;
    notes?: string;
  }[];
  cashbackExclusions?: string[];
  payoutSchedule?: "per_transaction" | "weekly" | "monthly" | "on_demand";
  welcomeBonus?: {
    usd?: number;
    token?: string;
    spendUsd?: number;
    endsAt?: string;
  } | null;
  topupCapMonthlyUsd?: number | null;
  topupMethods?: string[];
  fiatCurrencies?: string[];
  creditLimitUsd?: number | null;
  aprPct?: number | null;
  creditCheckRequired?: boolean;
  secured?: boolean;
  collateralLtvPct?: number | null;
  replacementFeeUsd?: number;
  inactivityFeeUsd?: number;
  deliveryFeeUsd?: number;
  fxWeekendMarkupPct?: number | null;
  ageMin?: number;
  residencyRequired?: boolean;
  kycProvider?: string;
  fundsProtection?: string;
  appRequired?: boolean;
  platforms?: string[];
  officialUrl?: string;
  /** Site-relative path to a real card-face render; empty falls back to `CardArt`. */
  cardImageUrl?: string;
  affiliateNetwork?: string;
  parentSlug?: string;
  benefits?: CardBenefit[];
};

/* ------------------------------------------------------------------ */
/* Country groups (ISO-3166 alpha-2)                                   */
/* ------------------------------------------------------------------ */

export const EEA = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "NO", "PL", "PT", "RO",
  "SK", "SI", "ES", "SE", "IS", "LI",
];

const UK = ["GB", "GI", "IM", "JE"];

const LATAM = [
  "MX", "BR", "AR", "CO", "CL", "PE", "EC", "UY", "PY", "BO", "CR", "PA",
  "DO", "GT", "SV", "HN",
];

const APAC = ["SG", "JP", "KR", "HK", "TW", "MY", "TH", "PH", "VN", "ID", "IN", "AU", "NZ"];

const GLOBAL = [
  "US", "CA", ...EEA, ...UK, ...APAC, ...LATAM,
  "CH", "AE", "SA", "QA", "KW", "BH", "OM", "TR", "IL", "ZA", "NG", "KE",
  "GH", "EG", "MA",
];

const US = ["US"];
const US_CA = ["US", "CA"];
const CA = ["CA"];
const AU_NZ = ["AU", "NZ"];
const EEA_UK = [...EEA, ...UK];
const US_EEA_UK = ["US", ...EEA, ...UK];

/* ------------------------------------------------------------------ */
/* Card catalog (from Postgres)                                        */
/* ------------------------------------------------------------------ */

/**
 * Card content lives in Postgres (`cards` + `card_tiers`) and is snapshotted
 * into `cards.generated.json` by `npm run db:sync`, which `npm run build` runs
 * first. That keeps every page pre-rendered: to change a card, edit the row and
 * rebuild — no code change.
 *
 * `db/seed-cards.json` is the fixture that populates an empty table via
 * `npm run db:seed`; it is not read at runtime.
 */
export const cards: Card[] = cardsFromDb as unknown as Card[];

export const cardBySlug = new Map(cards.map((c) => [c.slug, c]));

/**
 * Featured partners are distinct from `isSponsored`: featured partners get the
 * large "Featured partners" homepage placement, while sponsored cards get
 * pinned placement in the directory plus a Sponsored badge.
 * Move to a DB flag if partners change frequently.
 */
export const featuredPartnerSlugs = new Set<string>([
  "metamask-card-metal",
  "etherfi-cash-luxe",
  "coca-card",
]);

export function isFeaturedPartner(card: Card): boolean {
  return featuredPartnerSlugs.has(card.slug);
}

/* ------------------------------------------------------------------ */
/* Product families                                                    */
/* ------------------------------------------------------------------ */

/**
 * Brand token of a display name: "Bybit - VIP Card" -> "bybit",
 * "Crypto.com Visa - Ruby Steel Card" -> "crypto.com".
 */
function brandToken(name: string) {
  return name.split(" - ")[0]?.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
}

/** Slug the tier-split left on the parent row; siblings share it. */
function familyId(card: Card) {
  return card.parentSlug || card.slug;
}

/** Display brand, e.g. "Bybit" from "Bybit - VIP Card" or "Crypto.com Visa - Ruby Steel Card". */
export function brandName(card: Card) {
  return card.name.split(" - ")[0]?.trim().split(/\s+/)[0] ?? card.name;
}

/**
 * Cards from the same company/product line — the tiers that used to live in
 * `card_tiers` before they became their own cards, plus anything else whose
 * name starts with the same brand. Ordered cheapest-first so it reads as a tier
 * ladder. Returns [] for a product with no siblings, so pages can hide it.
 */
export function relatedFamilyCards(card: Card, limit = 8): Card[] {
  const token = brandToken(card.name);
  return cards
    .filter((item) => item.slug !== card.slug)
    .filter((item) => familyId(item) === familyId(card) || brandToken(item.name) === token)
    .sort((a, b) => a.annualFeeUsd - b.annualFeeUsd || b.cashbackMaxPct - a.cashbackMaxPct)
    .slice(0, limit);
}

export const cryptoOptions = [
  { symbol: "USDT", name: "Tether", color: "#26a17b" },
  { symbol: "USDC", name: "USD Coin", color: "#2775ca" },
  { symbol: "BTC", name: "Bitcoin", color: "#f7931a" },
  { symbol: "ETH", name: "Ethereum", color: "#627eea" },
  { symbol: "SOL", name: "Solana", color: "#14f195" },
  { symbol: "XMR", name: "Monero", color: "#f26822" },
  { symbol: "EURe", name: "Monerium EURe", color: "#2f8f79" },
  { symbol: "GNO", name: "Gnosis", color: "#0b2f2a" },
  { symbol: "CRO", name: "Cronos", color: "#002d74" },
  { symbol: "NEXO", name: "Nexo", color: "#1b4aff" },
  { symbol: "PLU", name: "Plutus", color: "#b06bff" },
  { symbol: "WBTC", name: "Wrapped BTC", color: "#f7931a" },
  { symbol: "DAI", name: "Dai", color: "#f5ac37" },
  { symbol: "XRP", name: "XRP", color: "#23292f" },
  { symbol: "LTC", name: "Litecoin", color: "#345d9d" },
  { symbol: "TRX", name: "Tron", color: "#eb0029" },
  { symbol: "DOGE", name: "Dogecoin", color: "#c2a633" },
];

export const chainOptions = [
  "Ethereum", "Solana", "Arbitrum", "Base", "Polygon", "Tron", "BNB Chain",
  "Optimism", "Bitcoin", "Monero", "Gnosis", "Cronos", "Avalanche", "Sui", "Aptos",
  "OKX Chain", "XRP Ledger", "Stellar",
];

export const walletOptions = [
  { value: "apple_pay", label: "Apple Pay" },
  { value: "google_pay", label: "Google Pay" },
  { value: "samsung_pay", label: "Samsung Pay" },
] as const;

export const networkLabel: Record<Network, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  unionpay: "UnionPay",
};

export const cardTypeLabel: Record<CardType, string> = {
  debit: "Debit",
  credit: "Credit",
  prepaid: "Prepaid",
};

export const custodyLabel: Record<CustodyModel, string> = {
  self_custody: "Self-custody",
  custodial: "Custodial",
  hybrid: "Hybrid",
};

export const kycLabel: Record<KycLevel, string> = {
  no_kyc: "No KYC",
  light_kyc: "Light KYC",
  full_kyc: "Full KYC",
};

export const audienceLabel: Record<Audience, string> = {
  personal: "Personal",
  business: "Business",
  both: "Personal & business",
};
