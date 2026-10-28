/**
 * Row shapes for the `cards`, `card_tiers` and `card_benefits` tables in Neon.
 *
 * These mirror the columns exactly as Postgres stores them (snake_case, string
 * unions, `numeric` read as string) and are what `src/lib/cards-db.ts` maps into
 * the camelCase `Card` shape the UI renders. Schema lives in
 * `db/cards-schema.sql`.
 */

export type CardNetwork = "visa" | "mastercard" | "unionpay" | "other";
export type CardKind = "debit" | "credit" | "prepaid" | "dual_mode";
export type CardCustody = "custodial" | "self_custody" | "hybrid";
export type CardKycLevel = "no_kyc" | "light_kyc" | "full_kyc";
export type RewardAssetType = "crypto" | "stablecoin" | "native_token" | "stocks_gold";
export type CardStatus = "live" | "waitlist" | "beta" | "paused" | "discontinued";
export type PayoutSchedule = "per_transaction" | "weekly" | "monthly" | "on_demand";
export type BenefitType =
  | "cashback"
  | "welcome_bonus"
  | "lounge"
  | "subscription_rebate"
  | "travel"
  | "insurance"
  | "purchase_protection"
  | "fx"
  | "atm"
  | "yield"
  | "concierge"
  | "other";

export type RewardCategory = {
  category?: string;
  pct?: number;
  capUsd?: number | null;
  notes?: string;
};

export type CardTierRow = {
  id: string;
  card_id: string;
  tier_name: string;
  tier_order: number;
  annual_fee_usd: string;
  monthly_fee_usd: string;
  stake_or_portfolio_req: string | null;
  cashback_pct: string;
  fx_fee_pct: string;
  balance_yield_apy_pct: string;
  atm_free_allowance_usd: string;
  atm_fee_notes: string | null;
  daily_spend_limit_usd: string | null;
  tier_perks: string[];

  // v2
  cashback_cap_monthly_usd: string | null;
  travel_reward_pct: string;
  atm_monthly_cap_usd: string | null;
  topup_cap_monthly_usd: string | null;
  lounge_visits_per_year: number | null;

  created_at: string;
  updated_at: string;
};

export type CardBenefitRow = {
  id: string;
  card_id: string;
  tier_id: string | null;
  benefit_type: BenefitType;
  title: string;
  value_json: Record<string, unknown>;
  details: string | null;
  source_url: string | null;
  last_verified_at: string | null;
  sort_order: number;
  created_at: string;
};

export type CardRow = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  logo_url: string | null;
  card_image_url: string | null;

  // display columns added for this site
  logo_text: string | null;
  brand_from: string | null;
  brand_to: string | null;
  brand_ink: string | null;
  website: string | null;
  audience: string | null;
  no_kyc_limit_usd: string | null;
  payout_token: string | null;
  staking_requirement: string | null;
  requirements_text: string | null;
  launched_at: string | null;
  description: string | null;
  pros: string[];
  cons: string[];

  affiliate_url: string;
  issuer_bank: string | null;

  // architecture & custody
  network: CardNetwork;
  card_type: CardKind;
  custody_model: CardCustody;
  custody_tech: string | null;
  settlement_chain: string | null;

  // forms & wallets
  has_virtual: boolean;
  has_physical: boolean;
  has_metal: boolean;
  mobile_wallets: string[];

  // compliance & geography
  kyc_level: CardKycLevel;
  kyc_notes: string | null;
  supported_countries: string[];
  excluded_countries: string[];
  regional_scope: string | null;

  // costs & fx
  annual_fee_usd: string;
  monthly_fee_usd: string;
  issuance_virtual_fee_usd: string;
  issuance_physical_fee_usd: string;
  topup_fee_pct: string;
  topup_fee_notes: string | null;
  fx_fee_pct: string;
  fx_fee_notes: string | null;
  is_gasless: boolean;

  // atm
  atm_fee_text: string | null;
  atm_local_fee_pct: string;
  atm_intl_fee_pct: string;
  atm_monthly_free_allowance_usd: string;
  monthly_atm_limit_usd: string | null;

  // rewards & yield
  cashback_min_pct: string;
  cashback_max_pct: string;
  reward_asset_type: RewardAssetType;
  reward_assets_supported: string[];
  balance_yield_apy_pct: string;
  requires_staking: boolean;
  staking_token_name: string | null;
  borrowing_min_apr_pct: string | null;

  // limits
  daily_spend_limit_usd: string | null;
  monthly_spend_limit_usd: string | null;
  daily_atm_limit_usd: string | null;

  // currencies & networks
  supported_cryptos: string[];
  supported_chains: string[];

  // perks & value-adds
  perks: string[];
  has_iban: boolean;
  insurance_coverage_usd: string;

  // site display flags
  rating_score: string;
  review_count: number;
  is_verified: boolean;
  is_sponsored: boolean;
  sponsor_priority: number;

  // v2: lifecycle & provenance
  status: CardStatus;
  source_url: string | null;
  last_verified_at: string | null;

  // v2: rewards detail
  cashback_cap_monthly_usd: string | null;
  reward_categories: RewardCategory[];
  cashback_exclusions: string[];
  payout_schedule: PayoutSchedule | null;
  welcome_bonus_usd: string | null;
  welcome_bonus_token: string | null;
  welcome_bonus_spend_usd: string | null;
  welcome_bonus_ends_at: string | null;

  // v2: top-up & fiat rails
  topup_cap_monthly_usd: string | null;
  topup_methods: string[];
  fiat_currencies: string[];

  // v2: credit terms
  credit_limit_usd: string | null;
  apr_pct: string | null;
  credit_check_required: boolean;
  secured: boolean;
  collateral_ltv_pct: string | null;

  // v2: fixed fees
  replacement_fee_usd: string;
  inactivity_fee_usd: string;
  delivery_fee_usd: string;

  // v2: fx
  fx_weekend_markup_pct: string | null;

  // v2: eligibility & protection
  age_min: number;
  residency_required: boolean;
  kyc_provider: string | null;
  funds_protection: string | null;

  // v2: distribution & attribution
  app_required: boolean;
  platforms: string[];
  official_url: string | null;
  affiliate_network: string | null;
  parent_slug: string | null;

  created_at: string;
  updated_at: string;
};
