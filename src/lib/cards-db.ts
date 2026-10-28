import { neon } from "@neondatabase/serverless";
import type { Card, CardBenefit } from "./data";
import type {
  CardBenefitRow,
  CardRow,
  CardTierRow,
  RewardCategory,
} from "./cards-schema";

/**
 * Reads the card catalog from Postgres and maps the rows onto the `Card` shape
 * the UI renders.
 *
 * Only `scripts/sync-cards.ts` calls this: the site pre-renders its pages, so it
 * reads cards synchronously from the snapshot that script writes. Keeping the
 * mapping here (rather than in the script) means it is type-checked against the
 * column list in `src/lib/cards-schema.ts`.
 *
 * Postgres returns `numeric` and `date` as strings, so every value is coerced.
 */

const NETWORKS = new Set(["visa", "mastercard", "unionpay"]);
const KINDS = new Set(["debit", "credit", "prepaid"]);
const CUSTODY = new Set(["self_custody", "custodial", "hybrid"]);
const AUDIENCES = new Set(["personal", "business", "both"]);
const KYC = new Set(["no_kyc", "light_kyc", "full_kyc"]);
const WALLETS = new Set(["apple_pay", "google_pay", "samsung_pay"]);
const STATUSES = new Set(["live", "waitlist", "beta", "paused", "discontinued"]);
const PAYOUT_SCHEDULES = new Set([
  "per_transaction",
  "weekly",
  "monthly",
  "on_demand",
]);

const num = (value: string | number | null | undefined, fallback = 0): number => {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** Same coercion as `num`, but keeps "not published" distinct from zero. */
const numOrNull = (
  value: string | number | null | undefined,
): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const text = (value: string | null | undefined, fallback = ""): string =>
  value === null || value === undefined ? fallback : String(value);

const list = (value: string[] | null | undefined): string[] =>
  Array.isArray(value) ? value.map(String) : [];

/** Narrows an arbitrary column value onto one of the unions `Card` allows. */
function oneOf<T extends string>(
  value: string | null | undefined,
  allowed: Set<string>,
  fallback: T,
): T {
  return allowed.has(String(value)) ? (value as T) : fallback;
}

function optionalOneOf<T extends string>(
  value: string | null | undefined,
  allowed: Set<string>,
): T | undefined {
  return value && allowed.has(value) ? (value as T) : undefined;
}

/**
 * A `date` column arrives either as "2025-06-18" or as a Date at local midnight.
 * Local getters are used for the Date case because `toISOString()` round-trips
 * through UTC and moves midnight back a day in any timezone ahead of UTC.
 */
function day(value: unknown, fallback = ""): string {
  if (!value) return fallback;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return fallback;
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const date = String(value.getDate()).padStart(2, "0");
    return `${value.getFullYear()}-${month}-${date}`;
  }
  const match = String(value).match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : fallback;
}

function toBenefit(row: CardBenefitRow): CardBenefit {
  return {
    type: row.benefit_type,
    title: row.title,
    value:
      row.value_json && typeof row.value_json === "object"
        ? row.value_json
        : {},
    details: text(row.details),
    sourceUrl: text(row.source_url),
  };
}

function toCard(
  row: CardRow,
  index: number,
  tiers: CardTierRow[],
  benefits: CardBenefitRow[],
  tierBenefits: Map<string, CardBenefitRow[]>,
): Card {
  const hasWelcomeBonus =
    row.welcome_bonus_usd !== null ||
    row.welcome_bonus_token !== null ||
    row.welcome_bonus_spend_usd !== null ||
    row.welcome_bonus_ends_at !== null;

  return {
    // The UI only uses `id` as a React key and for its expanded-row set, so a
    // stable position in the ordered catalog is enough.
    id: index + 1,
    name: row.name,
    slug: row.slug,
    tagline: text(row.tagline),
    logoText: text(row.logo_text),
    brand: {
      from: text(row.brand_from, "#0f3d2e"),
      to: text(row.brand_to, "#54d2a1"),
      ink: text(row.brand_ink, "#eafff6"),
    },
    affiliateUrl: row.affiliate_url,
    website: text(row.website),
    issuerName: text(row.issuer_bank),
    network: oneOf(row.network, NETWORKS, "visa"),
    cardType: oneOf(row.card_type, KINDS, "debit"),
    custodyModel: oneOf(row.custody_model, CUSTODY, "custodial"),
    audience: oneOf(row.audience, AUDIENCES, "both"),
    hasVirtual: Boolean(row.has_virtual),
    hasPhysical: Boolean(row.has_physical),
    kycLevel: oneOf(row.kyc_level, KYC, "full_kyc"),
    noKycLimitUsd: num(row.no_kyc_limit_usd),
    cashbackMinPct: num(row.cashback_min_pct),
    cashbackMaxPct: num(row.cashback_max_pct),
    issuanceFeeUsd: num(row.issuance_physical_fee_usd),
    annualFeeUsd: num(row.annual_fee_usd),
    monthlyFeeUsd: num(row.monthly_fee_usd),
    topupFeePct: num(row.topup_fee_pct),
    topupFeeNotes: text(row.topup_fee_notes, "Free crypto top-ups"),
    fxFeePct: num(row.fx_fee_pct),
    fxFeeNotes: text(row.fx_fee_notes, "0% on USD spend"),
    atmFeePct: num(row.atm_local_fee_pct),
    atmFeeNote: text(row.atm_fee_text, "Free at in-network ATMs"),
    maxDailySpendUsd: num(row.daily_spend_limit_usd, 10_000),
    monthlyAtmLimitUsd: num(
      row.monthly_atm_limit_usd,
      num(row.atm_monthly_free_allowance_usd),
    ),
    payoutToken: text(row.payout_token, "USD"),
    stakingRequirement: text(row.staking_requirement, "None"),
    perks: list(row.perks),
    requirementsText: text(row.requirements_text, "Standard identity verification"),
    supportedCryptos: list(row.supported_cryptos),
    supportedChains: list(row.supported_chains),
    mobileWallets: list(row.mobile_wallets).filter((wallet) =>
      WALLETS.has(wallet),
    ) as Card["mobileWallets"],
    supportedCountries: list(row.supported_countries),
    regionLabel: text(row.regional_scope),
    ratingScore: num(row.rating_score, 7.5),
    reviewCount: num(row.review_count),
    isVerified: Boolean(row.is_verified),
    isSponsored: Boolean(row.is_sponsored),
    sponsorPriority: num(row.sponsor_priority, 99),
    launchedAt: day(row.launched_at, "2024-01-15"),
    description: text(row.description),
    pros: list(row.pros),
    cons: list(row.cons),
    tiers: tiers.map((tier) => ({
      name: tier.tier_name,
      stake: text(tier.stake_or_portfolio_req, "$0"),
      cashbackPct: num(tier.cashback_pct),
      annualFeeUsd: num(tier.annual_fee_usd),
      fxFeePct: num(tier.fx_fee_pct),
      perks: list(tier.tier_perks),
      monthlyFeeUsd: num(tier.monthly_fee_usd),
      atmFreeAllowanceUsd: num(tier.atm_free_allowance_usd),
      cashbackCapMonthlyUsd: numOrNull(tier.cashback_cap_monthly_usd),
      travelRewardPct: num(tier.travel_reward_pct),
      atmMonthlyCapUsd: numOrNull(tier.atm_monthly_cap_usd),
      topupCapMonthlyUsd: numOrNull(tier.topup_cap_monthly_usd),
      loungeVisitsPerYear: tier.lounge_visits_per_year ?? null,
      benefits: (tierBenefits.get(tier.id) ?? []).map(toBenefit),
    })),

    status: oneOf(row.status, STATUSES, "live"),
    sourceUrl: text(row.source_url),
    lastVerifiedAt: day(row.last_verified_at),
    hasMetal: Boolean(row.has_metal),
    monthlySpendLimitUsd: numOrNull(row.monthly_spend_limit_usd),
    dailyAtmLimitUsd: numOrNull(row.daily_atm_limit_usd),
    balanceYieldApyPct: num(row.balance_yield_apy_pct),
    insuranceCoverageUsd: num(row.insurance_coverage_usd),
    hasIban: Boolean(row.has_iban),
    cashbackCapMonthlyUsd: numOrNull(row.cashback_cap_monthly_usd),
    rewardCategories: Array.isArray(row.reward_categories)
      ? row.reward_categories.filter(
          (category): category is RewardCategory =>
            Boolean(category) && typeof category === "object",
        )
      : [],
    cashbackExclusions: list(row.cashback_exclusions),
    payoutSchedule: optionalOneOf(row.payout_schedule, PAYOUT_SCHEDULES),
    welcomeBonus: hasWelcomeBonus
      ? {
          usd: numOrNull(row.welcome_bonus_usd) ?? undefined,
          token: text(row.welcome_bonus_token) || undefined,
          spendUsd: numOrNull(row.welcome_bonus_spend_usd) ?? undefined,
          endsAt: day(row.welcome_bonus_ends_at) || undefined,
        }
      : null,
    topupCapMonthlyUsd: numOrNull(row.topup_cap_monthly_usd),
    topupMethods: list(row.topup_methods),
    fiatCurrencies: list(row.fiat_currencies),
    creditLimitUsd: numOrNull(row.credit_limit_usd),
    aprPct: numOrNull(row.apr_pct),
    creditCheckRequired: Boolean(row.credit_check_required),
    secured: Boolean(row.secured),
    collateralLtvPct: numOrNull(row.collateral_ltv_pct),
    replacementFeeUsd: num(row.replacement_fee_usd),
    inactivityFeeUsd: num(row.inactivity_fee_usd),
    deliveryFeeUsd: num(row.delivery_fee_usd),
    fxWeekendMarkupPct: numOrNull(row.fx_weekend_markup_pct),
    ageMin: num(row.age_min, 18),
    residencyRequired: Boolean(row.residency_required),
    kycProvider: text(row.kyc_provider),
    fundsProtection: text(row.funds_protection),
    appRequired: Boolean(row.app_required),
    platforms: list(row.platforms),
    officialUrl: text(row.official_url),
    affiliateNetwork: text(row.affiliate_network),
    parentSlug: text(row.parent_slug),
    benefits: benefits.map(toBenefit),
  };
}

/**
 * Fetches every card, tier and benefit. Ordering matches what the directory
 * expects: sponsored slots first, then by rating, then name.
 */
export async function fetchCards(connectionString: string): Promise<Card[]> {
  const sql = neon(connectionString);

  const rows = (await sql`
    select * from cards
    order by sponsor_priority asc, rating_score desc, name asc
  `) as unknown as CardRow[];

  const tierRows = (await sql`
    select * from card_tiers order by card_id, tier_order asc, tier_name asc
  `) as unknown as CardTierRow[];

  const benefitRows = (await sql`
    select * from card_benefits
    order by card_id, sort_order asc, title asc
  `) as unknown as CardBenefitRow[];

  const tiersByCard = new Map<string, CardTierRow[]>();
  for (const tier of tierRows) {
    const bucket = tiersByCard.get(tier.card_id);
    if (bucket) bucket.push(tier);
    else tiersByCard.set(tier.card_id, [tier]);
  }

  const cardBenefits = new Map<string, CardBenefitRow[]>();
  const tierBenefits = new Map<string, Map<string, CardBenefitRow[]>>();
  for (const benefit of benefitRows) {
    if (benefit.tier_id) {
      let byTier = tierBenefits.get(benefit.card_id);
      if (!byTier) {
        byTier = new Map();
        tierBenefits.set(benefit.card_id, byTier);
      }
      const bucket = byTier.get(benefit.tier_id);
      if (bucket) bucket.push(benefit);
      else byTier.set(benefit.tier_id, [benefit]);
      continue;
    }
    const bucket = cardBenefits.get(benefit.card_id);
    if (bucket) bucket.push(benefit);
    else cardBenefits.set(benefit.card_id, [benefit]);
  }

  return rows.map((row, index) =>
    toCard(
      row,
      index,
      tiersByCard.get(row.id) ?? [],
      cardBenefits.get(row.id) ?? [],
      tierBenefits.get(row.id) ?? new Map(),
    ),
  );
}
