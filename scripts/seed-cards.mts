import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { loadEnv } from "./env.mts";
import type { Card } from "../src/lib/data.ts";

/**
 * Loads `db/seed-cards.json` into the Neon `cards` and `card_tiers` tables.
 *
 *   npm run db:seed
 *
 * Idempotent: cards are matched on `slug`, and a card's tiers are replaced.
 * Tiers are always rewritten rather than merged, because `card_tiers` has no
 * natural key to match on.
 *
 * Values come back from Postgres as strings for `numeric` and `date` columns,
 * so everything is coerced on the way out in `scripts/sync-cards.mjs`.
 */

const url = loadEnv();
if (!url) {
  console.error("No DATABASE_URL found in .env.local or .env — nothing to seed.");
  process.exit(1);
}

const sql = neon(url);
const cards = JSON.parse(readFileSync("db/seed-cards.json", "utf8")) as Card[];

const STABLES = new Set(["USDC", "USDT", "DAI", "PYUSD", "USDe"]);

const rewardAssetType = (card: Card) =>
  STABLES.has(card.payoutToken) ? "stablecoin" : "crypto";

let cardCount = 0;
let tierCount = 0;

for (const [index, card] of cards.entries()) {
  const rows = await sql`
    insert into cards (
      name, slug, tagline, logo_text, logo_url,
      brand_from, brand_to, brand_ink,
      affiliate_url, website, issuer_bank,
      network, card_type, custody_model,
      has_virtual, has_physical, has_metal, mobile_wallets,
      kyc_level, supported_countries, excluded_countries, regional_scope,
      annual_fee_usd, monthly_fee_usd,
      issuance_virtual_fee_usd, issuance_physical_fee_usd,
      topup_fee_pct, topup_fee_notes, fx_fee_pct, fx_fee_notes,
      atm_fee_text, atm_local_fee_pct, atm_intl_fee_pct,
      atm_monthly_free_allowance_usd, monthly_atm_limit_usd,
      cashback_min_pct, cashback_max_pct,
      reward_asset_type, reward_assets_supported,
      requires_staking, staking_requirement, staking_token_name,
      daily_spend_limit_usd,
      supported_cryptos, supported_chains, perks,
      rating_score, review_count, is_verified, is_sponsored, sponsor_priority,
      audience, no_kyc_limit_usd, payout_token, requirements_text,
      launched_at, description, pros, cons
    ) values (
      ${card.name}, ${card.slug}, ${card.tagline}, ${card.logoText}, ${null},
      ${card.brand.from}, ${card.brand.to}, ${card.brand.ink},
      ${card.affiliateUrl}, ${card.website}, ${card.issuerName},
      ${card.network}, ${card.cardType}, ${card.custodyModel},
      ${card.hasVirtual}, ${card.hasPhysical}, ${false}, ${card.mobileWallets},
      ${card.kycLevel}, ${card.supportedCountries}, ${[]}, ${card.regionLabel},
      ${card.annualFeeUsd}, ${card.monthlyFeeUsd},
      ${0}, ${card.issuanceFeeUsd},
      ${card.topupFeePct}, ${card.topupFeeNotes}, ${card.fxFeePct}, ${card.fxFeeNotes},
      ${card.atmFeeNote}, ${card.atmFeePct}, ${card.atmFeePct},
      ${card.monthlyAtmLimitUsd}, ${card.monthlyAtmLimitUsd},
      ${card.cashbackMinPct}, ${card.cashbackMaxPct},
      ${rewardAssetType(card)}, ${[card.payoutToken]},
      ${card.stakingRequirement !== "None"}, ${card.stakingRequirement}, ${null},
      ${card.maxDailySpendUsd},
      ${card.supportedCryptos}, ${card.supportedChains}, ${card.perks},
      ${card.ratingScore}, ${card.reviewCount}, ${card.isVerified}, ${card.isSponsored},
      ${card.isSponsored ? index + 1 : 99},
      ${card.audience}, ${card.noKycLimitUsd}, ${card.payoutToken}, ${card.requirementsText},
      ${card.launchedAt}, ${card.description}, ${card.pros}, ${card.cons}
    )
    on conflict (slug) do update set
      name = excluded.name,
      tagline = excluded.tagline,
      logo_text = excluded.logo_text,
      brand_from = excluded.brand_from,
      brand_to = excluded.brand_to,
      brand_ink = excluded.brand_ink,
      affiliate_url = excluded.affiliate_url,
      website = excluded.website,
      issuer_bank = excluded.issuer_bank,
      network = excluded.network,
      card_type = excluded.card_type,
      custody_model = excluded.custody_model,
      has_virtual = excluded.has_virtual,
      has_physical = excluded.has_physical,
      has_metal = excluded.has_metal,
      mobile_wallets = excluded.mobile_wallets,
      kyc_level = excluded.kyc_level,
      supported_countries = excluded.supported_countries,
      excluded_countries = excluded.excluded_countries,
      regional_scope = excluded.regional_scope,
      annual_fee_usd = excluded.annual_fee_usd,
      monthly_fee_usd = excluded.monthly_fee_usd,
      issuance_virtual_fee_usd = excluded.issuance_virtual_fee_usd,
      issuance_physical_fee_usd = excluded.issuance_physical_fee_usd,
      topup_fee_pct = excluded.topup_fee_pct,
      topup_fee_notes = excluded.topup_fee_notes,
      fx_fee_pct = excluded.fx_fee_pct,
      fx_fee_notes = excluded.fx_fee_notes,
      atm_fee_text = excluded.atm_fee_text,
      atm_local_fee_pct = excluded.atm_local_fee_pct,
      atm_intl_fee_pct = excluded.atm_intl_fee_pct,
      atm_monthly_free_allowance_usd = excluded.atm_monthly_free_allowance_usd,
      monthly_atm_limit_usd = excluded.monthly_atm_limit_usd,
      cashback_min_pct = excluded.cashback_min_pct,
      cashback_max_pct = excluded.cashback_max_pct,
      reward_asset_type = excluded.reward_asset_type,
      reward_assets_supported = excluded.reward_assets_supported,
      requires_staking = excluded.requires_staking,
      staking_requirement = excluded.staking_requirement,
      daily_spend_limit_usd = excluded.daily_spend_limit_usd,
      supported_cryptos = excluded.supported_cryptos,
      supported_chains = excluded.supported_chains,
      perks = excluded.perks,
      rating_score = excluded.rating_score,
      review_count = excluded.review_count,
      is_verified = excluded.is_verified,
      is_sponsored = excluded.is_sponsored,
      sponsor_priority = excluded.sponsor_priority,
      audience = excluded.audience,
      no_kyc_limit_usd = excluded.no_kyc_limit_usd,
      payout_token = excluded.payout_token,
      requirements_text = excluded.requirements_text,
      launched_at = excluded.launched_at,
      description = excluded.description,
      pros = excluded.pros,
      cons = excluded.cons,
      updated_at = now()
    returning id
  `;

  const cardId = rows[0].id;
  cardCount += 1;

  await sql`delete from card_tiers where card_id = ${cardId}`;

  for (const [order, tier] of (card.tiers ?? []).entries()) {
    await sql`
      insert into card_tiers (
        card_id, tier_name, tier_order, annual_fee_usd, stake_or_portfolio_req,
        cashback_pct, fx_fee_pct, atm_free_allowance_usd, tier_perks
      ) values (
        ${cardId}, ${tier.name}, ${order + 1}, ${tier.annualFeeUsd}, ${tier.stake},
        ${tier.cashbackPct}, ${tier.fxFeePct}, ${0}, ${tier.perks}
      )
    `;
    tierCount += 1;
  }
}

console.log(`Seeded ${cardCount} cards and ${tierCount} tiers into ${new URL(url).host}.`);
