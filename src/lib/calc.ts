import type { Card } from "./data";

export type CalcInput = {
  spend: number;
  currency: string;
  token: string;
};

export type CalcResult = {
  card: Card;
  net: number;
  grossCashback: number;
  topupCost: number;
  fxCost: number;
  annualCost: number;
  tokenPenalty: number;
  effectiveReturnPct: number;
};

export function estimateCard(card: Card, input: CalcInput): CalcResult {
  const supportsToken = card.supportedCryptos.includes(input.token);
  const topupPct = card.topupFeePct + (supportsToken ? 0 : 0.5);
  const fxPct = input.currency === "USD" ? 0 : card.fxFeePct;
  const grossCashback = (input.spend * card.cashbackMaxPct) / 100;
  const topupCost = (input.spend * topupPct) / 100;
  const fxCost = (input.spend * fxPct) / 100;
  const annualCost = card.annualFeeUsd / 12;
  const net = grossCashback - topupCost - fxCost - annualCost;
  return {
    card,
    net,
    grossCashback,
    topupCost,
    fxCost,
    annualCost,
    tokenPenalty: supportsToken ? 0 : (input.spend * 0.5) / 100,
    effectiveReturnPct: input.spend > 0 ? (net / input.spend) * 100 : 0,
  };
}

export function rankCards(cards: Card[], input: CalcInput): CalcResult[] {
  return cards.map((card) => estimateCard(card, input)).sort((a, b) => b.net - a.net);
}
