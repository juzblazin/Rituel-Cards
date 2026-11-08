import type { Card } from "./data";

export type CalcInput = {
  spend: number;
  currency: string;
  token: string;
  /** Annualized % cost applied to capital locked for staking. 0 = excluded. */
  stakeOpportunityPct?: number;
};

export type CalcResult = {
  card: Card;
  net: number;
  grossCashback: number;
  topupCost: number;
  fxCost: number;
  annualCost: number;
  stakeCost: number;
  tokenPenalty: number;
  eligibleSpend: number;
  cappedByReward: boolean;
  limitedSpend: boolean;
  requiresStaking: boolean;
  effectiveReturnPct: number;
};

const NO_STAKE = /^(\$?0\b|none|free|no stake|no staking)/i;
const RECURRING_FEE = /subscription|membership|annual fee|\/\s?(yr|year|mo|month)\b|per (year|month)/i;
const STAKE_HINT = /stake|lock|hold|deposit|collateral|portfolio|balance|asset|vip|pledge/i;

/**
 * Estimates capital locked to unlock the card's rate, parsed from the free-text
 * staking requirement. Returns 0 when the requirement is really a recurring fee
 * (already priced as annual/monthly cost) or when the parsed amount is the fee.
 */
function lockedUsd(card: Card): number {
  const req = card.stakingRequirement;
  if (!req || NO_STAKE.test(req) || RECURRING_FEE.test(req) || !STAKE_HINT.test(req)) {
    return 0;
  }
  const match = req.match(/\$\s?([\d,]+(?:\.\d+)?)/);
  if (!match) return 0;
  const locked = Number(match[1].replace(/,/g, ""));
  if (!Number.isFinite(locked)) return 0;
  if (card.annualFeeUsd > 0 && Math.abs(locked - card.annualFeeUsd) < card.annualFeeUsd * 0.2) {
    return 0;
  }
  return locked;
}

export function estimateCard(card: Card, input: CalcInput): CalcResult {
  const supportsToken = card.supportedCryptos.includes(input.token);
  const topupPct = card.topupFeePct + (supportsToken ? 0 : 0.5);
  const fxPct = input.currency === "USD" ? 0 : card.fxFeePct;

  const spendLimit = card.monthlySpendLimitUsd;
  const eligibleSpend =
    spendLimit != null && spendLimit > 0 ? Math.min(input.spend, spendLimit) : input.spend;
  const limitedSpend = eligibleSpend < input.spend;

  const uncapped = (eligibleSpend * card.cashbackMaxPct) / 100;
  const cap = card.cashbackCapMonthlyUsd;
  const grossCashback = cap != null && cap > 0 ? Math.min(uncapped, cap) : uncapped;
  const cappedByReward = grossCashback < uncapped;

  const topupCost = (eligibleSpend * topupPct) / 100;
  const fxCost = (eligibleSpend * fxPct) / 100;
  const annualCost = card.annualFeeUsd / 12 + (card.monthlyFeeUsd ?? 0);

  const locked = lockedUsd(card);
  const stakeCost = (locked * (input.stakeOpportunityPct ?? 0)) / 100 / 12;

  const net = grossCashback - topupCost - fxCost - annualCost - stakeCost;
  return {
    card,
    net,
    grossCashback,
    topupCost,
    fxCost,
    annualCost,
    stakeCost,
    tokenPenalty: supportsToken ? 0 : (eligibleSpend * 0.5) / 100,
    eligibleSpend,
    cappedByReward,
    limitedSpend,
    requiresStaking:
      locked > 0 || (!!card.stakingRequirement && !NO_STAKE.test(card.stakingRequirement)),
    effectiveReturnPct: eligibleSpend > 0 ? (net / eligibleSpend) * 100 : 0,
  };
}

export function rankCards(cards: Card[], input: CalcInput): CalcResult[] {
  return cards.map((card) => estimateCard(card, input)).sort((a, b) => b.net - a.net);
}
