import { cardBySlug } from "./data";

/**
 * Crypto card leaderboard dataset — October 2026 snapshot.
 *
 * Figures are distilled from the Paymentscan leaderboard research (volume,
 * transactions, active addresses, issuer and chain mapping, mystery-shopping
 * FX audits and on-chain cashback distributions). Values we could not source
 * are left undefined and render as "—" rather than estimated.
 *
 * When Paymentscan API access is granted this file is the swap point:
 * a sync script can regenerate `entries` from
 *   GET /api/v1/projects/monthly?basis=spend&includeOffchainData=true
 * keeping this exact shape.
 */

export const AS_OF = "October 2026";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** Custody tiers from the spec: 1 = smart account, 2 = DeFi collateral, 3 = custodial pre-fund. */
export type CustodyTier = 1 | 2 | 3;

export type Basis = "spend" | "topups";

export type LeaderboardEntry = {
  /** Paymentscan program slug. */
  slug: string;
  name: string;
  /** RItuel catalog slug when a matching card exists — links the row to its review page. */
  cardSlug?: string;
  /** "inactive" = historical volume only, $0 spend in the snapshot month. */
  status: "live" | "inactive";

  /* Track 6 — infrastructure & custody */
  custodyTier?: CustodyTier;
  /** Hybrid notes, e.g. "custodial spend + self-custody yield vaults". */
  custodyNote?: string;
  paymentNetwork?: "visa" | "mastercard" | "visa_mastercard";
  /** Regulated card issuer / BIN sponsor. */
  issuer?: string;
  /** Hidden BaaS / virtual-account vendors behind the front end. */
  baasVendors?: string[];
  /** Settlement chains where the program clears transactions. */
  chains?: string[];

  /* Track 1 — volume & scale (USD, snapshot month) */
  monthlyVolumeUsd: number;
  allTimeVolumeUsd: number;
  growth30dPct?: number;
  growth90dPct?: number;
  /** True when volume is verifiable on-chain (survives includeOffchainData=false). */
  onchainVerified: boolean;
  /** Accounting basis of the tracked volume — top-ups mark custodial deposit tracking. */
  basis: Basis;
  volumeNote?: string;

  /* Track 2/3 — adoption & spend profile (snapshot month) */
  monthlyTx?: number;
  monthlyActiveSpenders?: number;
  /** Current active spenders vs trailing peak active base (%). */
  activeBaseRetentionPct?: number;
  /** "90d" | "1y" — window the retention figure covers. */
  retentionWindow?: string;
  lifetimeTx?: number;
  lifetimeAddresses?: number;

  /* Track 5 — net realized return */
  rewardToken?: string;
  /** Advertised headline cashback as marketed, e.g. "3%" or "0.5%–8%". */
  advertisedCashbackLabel?: string;
  /** Effective cashback at the standardised $1,000/mo domestic spend benchmark (%). */
  effectiveAt1kPct?: number;
  /** Net realized return, domestic base-currency spend (%). */
  netReturnDomesticPct?: number;
  /** Net realized return, foreign non-base currency spend (%). */
  netReturnForeignPct?: number;
  /** Empirically observed FX spread from mystery-shopping tests (%). */
  observedFxSpreadPct?: number;
  /** USD capital that must be staked/held to reach the top advertised tier. */
  stakingBurdenUsd?: number;
  stakingBurdenLabel?: string;
  /** USD cashback distributed on-chain in the snapshot month. */
  cashbackPaidUsd?: number;
};

/* ------------------------------------------------------------------ */
/* Ecosystem aggregates (October 2026, all tracked programs)           */
/* ------------------------------------------------------------------ */

export const ecosystem = {
  monthlyVolumeUsd: 1_370_000_000,
  monthlyTx: 12_943_642,
  monthlyActiveSpenders: 363_320,
  /** Spend verifiable on public chains — excludes issuer-reported feeds (RedotPay, BFinance). */
  onchainVerifiedVolumeUsd: 938_200_000,
  allTimeVolumeUsd: 13_870_000_000,
  cashbackPaidUsd: 3_248_000,
  allTimeCashbackUsd: 34_260_000,
  trackedPrograms: 32,
  /** Months of history behind the cumulative figure (Mar 2023 – Oct 2026). */
  monthsTracked: 44,
  /** Month-over-month volume velocity heading into the snapshot month. */
  momGrowthPct: 11.3,
} as const;

/** Market-level settlement rail mix, on-chain POS spend share (October 2026). */
export const chainMix: { chain: string; volumeUsd: number; sharePct: number; note?: string }[] = [
  { chain: "Base", volumeUsd: 259_100_000, sharePct: 27.62, note: "KAST, MetaMask, Plasma One, Karta.io" },
  { chain: "Optimism", volumeUsd: 144_600_000, sharePct: 15.41, note: "ether.fi Cash, Exa" },
  { chain: "Solana", volumeUsd: 141_100_000, sharePct: 15.04, note: "KAST, Avici, MetaMask, Phantom Cash" },
  { chain: "Arbitrum", volumeUsd: 86_040_000, sharePct: 9.17, note: "Multi-chain Rain/Bridge programs" },
  { chain: "Stellar", volumeUsd: 74_020_000, sharePct: 7.89, note: "Institutional USDC settlement" },
  { chain: "Polygon", volumeUsd: 63_690_000, sharePct: 6.79, note: "Retail stablecoin payment rail" },
  { chain: "Ethereum", volumeUsd: 39_280_000, sharePct: 4.19, note: "53% of stablecoin float, <5% of swipes" },
  { chain: "Other (11 chains)", volumeUsd: 130_300_000, sharePct: 13.89, note: "Arc, Plasma, Gnosis, Scroll, Linea, HyperEVM…" },
];

/* ------------------------------------------------------------------ */
/* The dataset — 30 tracked programs                                   */
/* ------------------------------------------------------------------ */

export const entries: LeaderboardEntry[] = [
  {
    slug: "redotpay",
    name: "RedotPay",
    cardSlug: "redotpay",
    status: "live",
    custodyTier: 3,
    custodyNote: "custodial deposit pool; Spend Credit/Earn adds a collateral mode",
    paymentNetwork: "visa_mastercard",
    issuer: "Multi-issuer (StraitsX / Reap / regional partners)",
    baasVendors: ["OpenPayd", "Red Dot Payment", "iSend"],
    chains: ["Tron", "Ethereum", "BNB Chain", "Solana", "Arbitrum", "Polygon", "Base"],
    monthlyVolumeUsd: 423_500_000,
    allTimeVolumeUsd: 7_007_000_000,
    onchainVerified: false,
    basis: "topups",
    volumeNote: "issuer-reported POS feed + on-chain deposits; 50.5% of all-time market volume",
    monthlyActiveSpenders: undefined,
    rewardToken: "USD",
    advertisedCashbackLabel: "3% (Pro)",
    effectiveAt1kPct: 1.8,
    netReturnDomesticPct: 0.51,
    stakingBurdenLabel: "None (Pro $12.90/mo) · $18/mo reward cap",
  },
  {
    slug: "etherfi",
    name: "ether.fi Cash",
    cardSlug: "etherfi-cash",
    status: "live",
    custodyTier: 2,
    custodyNote: "non-custodial borrow at 4% APR against yield-bearing vaults",
    paymentNetwork: "visa",
    issuer: "Rain",
    baasVendors: ["Bridge (Stripe)", "Due Network", "Sumsub"],
    chains: ["Optimism", "Scroll"],
    monthlyVolumeUsd: 141_900_000,
    allTimeVolumeUsd: 1_065_000_000,
    onchainVerified: true,
    basis: "spend",
    volumeNote: "#1 non-custodial DeFi credit card; crossed $1B all-time",
    monthlyTx: undefined,
    monthlyActiveSpenders: undefined,
    lifetimeTx: 13_421_309,
    lifetimeAddresses: 121_225,
    rewardToken: "ETHFI",
    advertisedCashbackLabel: "3%–4%",
    effectiveAt1kPct: 3.0,
    netReturnDomesticPct: 3.0,
    netReturnForeignPct: 0.96,
    observedFxSpreadPct: 2.04,
    stakingBurdenUsd: 15_000,
    stakingBurdenLabel: "$15K deposit or 30,000 ETHFI (Luxe)",
    cashbackPaidUsd: 1_638_000,
  },
  {
    slug: "kast",
    name: "KAST",
    cardSlug: "kast",
    status: "live",
    custodyTier: 3,
    custodyNote: "custodial spend + optional self-custody Privy yield vaults",
    paymentNetwork: "visa",
    issuer: "Rain",
    baasVendors: ["Bridge", "Lead Bank", "Noah", "Privy", "M0", "Gauntlet", "Sumsub"],
    chains: ["Solana", "Base", "EVM chains", "XRP Ledger"],
    monthlyVolumeUsd: 121_000_000,
    allTimeVolumeUsd: 954_100_000,
    onchainVerified: true,
    basis: "spend",
    volumeNote: "high-velocity Solana/Base neobank, approaching $1B all-time",
    rewardToken: "USD + KAST Points",
    advertisedCashbackLabel: "1.5%–3%",
    effectiveAt1kPct: 1.5,
    netReturnDomesticPct: 1.5,
    netReturnForeignPct: -0.34,
    observedFxSpreadPct: 1.84,
    stakingBurdenLabel: "25K KAST Points (Premium) · 250K (Private)",
  },
  {
    slug: "wirex-one",
    name: "Wirex One",
    cardSlug: "wirex-one",
    status: "live",
    custodyTier: 2,
    custodyNote: "hybrid neobank + 20–60% LTV crypto-backed credit",
    paymentNetwork: "visa_mastercard",
    issuer: "Wirex (principal member)",
    baasVendors: ["Crossmint"],
    chains: ["Arc"],
    monthlyVolumeUsd: 54_830_000,
    allTimeVolumeUsd: 164_200_000,
    growth30dPct: 14.4,
    onchainVerified: true,
    basis: "spend",
    volumeNote: "+2,717% four-month expansion on the Arc settlement chain",
    monthlyActiveSpenders: 23_196,
    lifetimeTx: 1_654_115,
    lifetimeAddresses: 32_481,
    rewardToken: "USD (+WPAY tiers)",
    advertisedCashbackLabel: "0.5%–8%",
    effectiveAt1kPct: 0.5,
    netReturnDomesticPct: 0.5,
    netReturnForeignPct: -0.75,
    observedFxSpreadPct: 1.25,
    stakingBurdenUsd: 50_000,
    stakingBurdenLabel: "$50K balance (Bespoke 8%)",
    cashbackPaidUsd: 740_600,
  },
  {
    slug: "karta",
    name: "Karta",
    status: "live",
    custodyTier: 3,
    custodyNote: "stablecoin Visa for emerging-market freelancers",
    paymentNetwork: "visa",
    issuer: "Banco Popular",
    chains: ["Tron", "Polygon", "Arbitrum", "Base", "Optimism", "Solana"],
    monthlyVolumeUsd: 53_630_000,
    allTimeVolumeUsd: 372_400_000,
    growth30dPct: 6.2,
    growth90dPct: 11.3,
    onchainVerified: true,
    basis: "topups",
    volumeNote: "emerging-market freelancer card, TRC-20 funded",
  },
  {
    slug: "plasma-one",
    name: "Plasma One",
    cardSlug: "plasma-one",
    status: "live",
    custodyTier: 3,
    custodyNote: "stablecoin neobank + Veda/Aave DeFi earn vault",
    paymentNetwork: "visa",
    issuer: "Rain",
    baasVendors: ["Bridge", "Veda", "Aave", "Sumsub", "Persona"],
    chains: ["Plasma", "Base", "Solana", "Arbitrum", "Optimism", "Tron", "HyperEVM"],
    monthlyVolumeUsd: 29_790_000,
    allTimeVolumeUsd: 105_100_000,
    growth30dPct: 19.0,
    growth90dPct: 178.5,
    onchainVerified: true,
    basis: "spend",
    rewardToken: "XPL",
    advertisedCashbackLabel: "2%–4% (+10% AI/airlines)",
    effectiveAt1kPct: 1.05,
    netReturnDomesticPct: 1.05,
    netReturnForeignPct: -1.25,
    observedFxSpreadPct: 2.3,
    stakingBurdenLabel: "20K XPL locked 12mo (Core) · 100K (Platinum)",
    cashbackPaidUsd: 749_600,
  },
  {
    slug: "kolo",
    name: "Kolo",
    cardSlug: "kolo",
    status: "live",
    custodyTier: 3,
    paymentNetwork: "visa",
    chains: ["Tron"],
    monthlyVolumeUsd: 20_500_000,
    allTimeVolumeUsd: 134_000_000,
    growth30dPct: -0.1,
    growth90dPct: 58.4,
    onchainVerified: true,
    basis: "topups",
    volumeNote: "BTC cashback & USDT Visa card",
    rewardToken: "BTC",
  },
  {
    slug: "karta-io",
    name: "Karta.io",
    status: "live",
    custodyTier: 1,
    custodyNote: "self-custody wallet with Visa Signature",
    paymentNetwork: "visa",
    issuer: "Rain",
    baasVendors: ["Sumsub"],
    chains: ["Tron", "Ethereum", "BNB Chain", "Polygon", "Arbitrum", "Optimism", "Base", "Solana"],
    monthlyVolumeUsd: 18_050_000,
    allTimeVolumeUsd: 152_900_000,
    growth30dPct: 4.3,
    growth90dPct: 20.3,
    onchainVerified: true,
    basis: "spend",
    rewardToken: "KARAT points",
    advertisedCashbackLabel: "0% direct (referral rewards)",
    effectiveAt1kPct: 0,
    netReturnDomesticPct: -1.5,
    netReturnForeignPct: -4.54,
    observedFxSpreadPct: 4.54,
    stakingBurdenLabel: "None",
  },
  {
    slug: "tria",
    name: "Tria",
    cardSlug: "tria",
    status: "live",
    custodyTier: 1,
    custodyNote: "chain-abstracted self-custodial card",
    paymentNetwork: "visa",
    monthlyVolumeUsd: 15_790_000,
    allTimeVolumeUsd: 181_800_000,
    growth30dPct: -4.2,
    growth90dPct: -14.7,
    onchainVerified: true,
    basis: "spend",
  },
  {
    slug: "coca",
    name: "Coca",
    cardSlug: "coca-card",
    status: "live",
    custodyTier: 1,
    custodyNote: "non-custodial/MPC wallet card on Wirex rails",
    paymentNetwork: "visa",
    issuer: "Wirex",
    chains: ["Polygon", "Base", "Ethereum", "Arc"],
    monthlyVolumeUsd: 7_821_000,
    allTimeVolumeUsd: 44_580_000,
    growth30dPct: -17.2,
    growth90dPct: 38.1,
    onchainVerified: true,
    basis: "spend",
    volumeNote: "Wirex-issued subscription/rewards card",
  },
  {
    slug: "gnosis-pay",
    name: "Gnosis Pay",
    cardSlug: "gnosis-pay",
    status: "live",
    custodyTier: 1,
    custodyNote: "Safe smart account — funds stay in self-custody until POS settlement",
    paymentNetwork: "visa",
    issuer: "Monerium",
    baasVendors: ["Monerium", "Sumsub"],
    chains: ["Gnosis", "Celo"],
    monthlyVolumeUsd: 6_083_000,
    allTimeVolumeUsd: 215_300_000,
    growth30dPct: -20.4,
    growth90dPct: -11.3,
    onchainVerified: true,
    basis: "spend",
    volumeNote: "pioneer Safe smart-account EURe card",
    monthlyTx: 127_259,
    monthlyActiveSpenders: 6_266,
    activeBaseRetentionPct: 59.1,
    retentionWindow: "1y",
    lifetimeTx: 4_024_539,
    rewardToken: "GNO",
    advertisedCashbackLabel: "0%–5%",
    effectiveAt1kPct: 0,
    netReturnDomesticPct: 0,
    netReturnForeignPct: 0,
    observedFxSpreadPct: 0,
    stakingBurdenUsd: 10_411,
    stakingBurdenLabel: "0.1–100 GNO held in Safe (~$10–$10.4K)",
    cashbackPaidUsd: 25_640,
  },
  {
    slug: "gate",
    name: "Gate Card",
    status: "live",
    custodyTier: 3,
    custodyNote: "exchange-issued card",
    paymentNetwork: "visa",
    monthlyVolumeUsd: 3_790_000,
    allTimeVolumeUsd: 10_650_000,
    growth30dPct: 59.3,
    growth90dPct: 255.0,
    onchainVerified: true,
    basis: "spend",
    volumeNote: "major exchange card breakout, live since Oct 2025",
  },
  {
    slug: "avici",
    name: "Avici",
    cardSlug: "avici",
    status: "live",
    custodyTier: 1,
    custodyNote: "Solana-native self-custodial smart-wallet neobank",
    paymentNetwork: "visa",
    baasVendors: ["Iron (MoonPay)", "Sumsub"],
    chains: ["Solana"],
    monthlyVolumeUsd: 3_681_000,
    allTimeVolumeUsd: 40_520_000,
    growth30dPct: -4.6,
    growth90dPct: 1.3,
    onchainVerified: true,
    basis: "spend",
  },
  {
    slug: "dogpay",
    name: "DogPay",
    status: "live",
    monthlyVolumeUsd: 3_432_000,
    allTimeVolumeUsd: 21_180_000,
    growth30dPct: 3.9,
    growth90dPct: 89.0,
    onchainVerified: true,
    basis: "spend",
    volumeNote: "recently indexed — $869K 7-day volume",
  },
  {
    slug: "metamask",
    name: "MetaMask Card",
    cardSlug: "metamask-card",
    status: "live",
    custodyTier: 1,
    custodyNote: "delegated allowance from a self-custodial MetaMask wallet",
    paymentNetwork: "mastercard",
    issuer: "Crypto Life (Baanx / Monavate)",
    baasVendors: ["Entravel", "Blackbird"],
    chains: ["Linea", "Base", "Solana", "Monad"],
    monthlyVolumeUsd: 3_383_000,
    allTimeVolumeUsd: 87_900_000,
    growth30dPct: -2.9,
    growth90dPct: -28.2,
    onchainVerified: true,
    basis: "spend",
    monthlyTx: 65_598,
    monthlyActiveSpenders: 4_076,
    activeBaseRetentionPct: 77.1,
    retentionWindow: "90d",
    lifetimeTx: 1_598_020,
    rewardToken: "mUSD",
    advertisedCashbackLabel: "1%–3%",
    effectiveAt1kPct: 1.0,
    netReturnDomesticPct: 1.0,
    netReturnForeignPct: -0.5,
    observedFxSpreadPct: 1.0,
    stakingBurdenLabel: "None",
  },
  {
    slug: "ethena-pay",
    name: "Ethena Pay",
    cardSlug: "ethena-pay",
    status: "live",
    custodyTier: 2,
    custodyNote: "USDe yield-bearing collateral via Rain",
    paymentNetwork: "visa",
    issuer: "Rain",
    chains: ["Avalanche", "Ethereum", "Arbitrum", "Base"],
    monthlyVolumeUsd: 3_125_000,
    allTimeVolumeUsd: 5_036_000,
    growth30dPct: 91.9,
    onchainVerified: true,
    basis: "spend",
    volumeNote: "62% of all-time volume occurred in the snapshot month",
    rewardToken: "AVAX",
    advertisedCashbackLabel: "4%–5% tiered",
    cashbackPaidUsd: 89_780,
  },
  {
    slug: "avalanche-card",
    name: "Avalanche Card",
    cardSlug: "avalanche-card",
    status: "live",
    custodyTier: 2,
    custodyNote: "non-custodial collateral-backed Visa via Rain",
    paymentNetwork: "visa",
    issuer: "Rain",
    chains: ["Avalanche", "Ethereum", "Arbitrum", "Base"],
    monthlyVolumeUsd: 2_849_000,
    allTimeVolumeUsd: 32_750_000,
    growth30dPct: -0.7,
    growth90dPct: 48.8,
    onchainVerified: true,
    basis: "spend",
  },
  {
    slug: "tuyo",
    name: "Tuyo",
    cardSlug: "tuyo-card",
    status: "live",
    custodyTier: 1,
    monthlyVolumeUsd: 2_113_000,
    allTimeVolumeUsd: 22_430_000,
    onchainVerified: true,
    basis: "spend",
    volumeNote: "emerging self-custodial card program tracked on-chain",
  },
  {
    slug: "bitget-wallet",
    name: "Bitget Wallet",
    cardSlug: "bitget-wallet-card",
    status: "live",
    monthlyVolumeUsd: 1_782_000,
    allTimeVolumeUsd: 47_440_000,
    growth30dPct: -2.4,
    growth90dPct: -60.0,
    onchainVerified: true,
    basis: "spend",
    volumeNote: "multi-chain wallet card",
    rewardToken: "Assetback",
    advertisedCashbackLabel: "2%–3%",
  },
  {
    slug: "exa",
    name: "Exa",
    cardSlug: "exa-card",
    status: "live",
    custodyTier: 2,
    custodyNote: "on-chain USDC credit protocol",
    chains: ["Optimism"],
    monthlyVolumeUsd: 1_714_000,
    allTimeVolumeUsd: 23_950_000,
    growth30dPct: -2.8,
    growth90dPct: 1.7,
    onchainVerified: true,
    basis: "spend",
  },
  {
    slug: "solayer",
    name: "Solayer",
    cardSlug: "solayer-card",
    status: "live",
    chains: ["Solana"],
    monthlyVolumeUsd: 1_286_000,
    allTimeVolumeUsd: 29_670_000,
    growth30dPct: -10.5,
    growth90dPct: -4.6,
    onchainVerified: true,
    basis: "spend",
    volumeNote: "Solana restaking-linked payment card",
  },
  {
    slug: "bfinance",
    name: "BFinance",
    status: "live",
    custodyTier: 3,
    custodyNote: "Telegram-based custodial app",
    paymentNetwork: "visa_mastercard",
    monthlyVolumeUsd: 1_139_000,
    allTimeVolumeUsd: 49_590_000,
    growth30dPct: 5.5,
    growth90dPct: -60.0,
    onchainVerified: false,
    basis: "topups",
    volumeNote: "issuer-reported off-chain transaction feed",
  },
  {
    slug: "phantom-cash",
    name: "Phantom Cash",
    cardSlug: "phantom-cash",
    status: "live",
    custodyTier: 1,
    custodyNote: "self-custodial Solana debit spending CASH",
    paymentNetwork: "visa",
    issuer: "Bridge",
    chains: ["Solana"],
    monthlyVolumeUsd: 1_066_000,
    allTimeVolumeUsd: 7_804_000,
    growth30dPct: -7.2,
    onchainVerified: true,
    basis: "spend",
    rewardToken: "CASH",
  },
  {
    slug: "hyperbeat",
    name: "Hyperbeat",
    cardSlug: "hyperbeat",
    status: "live",
    custodyTier: 2,
    custodyNote: "spends yield from HyperLiquid positions",
    chains: ["HyperEVM"],
    monthlyVolumeUsd: 691_200,
    allTimeVolumeUsd: 3_626_000,
    onchainVerified: true,
    basis: "spend",
    volumeNote: "-18.7% 7-day trend; consumer card on HyperEVM",
    rewardToken: "HYPE",
    advertisedCashbackLabel: "0.2%–1% (3%–12% boosts)",
    cashbackPaidUsd: 3_931,
  },
  {
    slug: "solid",
    name: "Solid",
    status: "live",
    monthlyVolumeUsd: 689_700,
    allTimeVolumeUsd: 977_900,
    onchainVerified: true,
    basis: "spend",
    volumeNote: "newly listed — 70.5% of all-time volume is from the snapshot month",
  },
  {
    slug: "safepal",
    name: "SafePal",
    status: "live",
    custodyTier: 1,
    custodyNote: "self-custody wallet paired with the Fiat24 banking gateway",
    paymentNetwork: "visa_mastercard",
    monthlyVolumeUsd: 296_600,
    allTimeVolumeUsd: 38_770_000,
    onchainVerified: true,
    basis: "spend",
  },
  {
    slug: "vaultleap",
    name: "VaultLeap",
    cardSlug: "vaultleap",
    status: "live",
    monthlyVolumeUsd: 34_160,
    allTimeVolumeUsd: 102_100,
    onchainVerified: true,
    basis: "spend",
    volumeNote: "early-stage — $7.2K–$8.6K 7-day volume",
  },
  {
    slug: "send",
    name: "Send",
    status: "live",
    custodyTier: 1,
    custodyNote: "non-custodial/MPC wallet card on Wirex rails",
    paymentNetwork: "visa",
    issuer: "Wirex",
    chains: ["Polygon", "Base", "Ethereum", "Arc"],
    monthlyVolumeUsd: 32_170,
    allTimeVolumeUsd: 144_700,
    onchainVerified: true,
    basis: "spend",
    volumeNote: "newly listed, Wirex real-time conversion",
  },
  {
    slug: "ready",
    name: "Ready",
    status: "inactive",
    monthlyVolumeUsd: 0,
    allTimeVolumeUsd: 61_680_000,
    onchainVerified: true,
    basis: "spend",
    volumeNote: "$0 active spend in the snapshot month",
  },
  {
    slug: "solflare",
    name: "Solflare",
    cardSlug: "solflare-card",
    status: "inactive",
    custodyTier: 1,
    chains: ["Solana"],
    monthlyVolumeUsd: 0,
    allTimeVolumeUsd: 6_698_000,
    onchainVerified: true,
    basis: "spend",
    volumeNote: "$0 active spend in the snapshot month",
  },
  /* Audited for Track 5 but not in the Oct 2026 volume ranking. */
  {
    slug: "ur",
    name: "UR Card",
    status: "live",
    custodyTier: 3,
    custodyNote: "unified Swiss IBAN + crypto account",
    paymentNetwork: "mastercard",
    issuer: "UR",
    baasVendors: ["Swiss IBAN (SEPA Instant + SWIFT)"],
    monthlyVolumeUsd: 0,
    allTimeVolumeUsd: 0,
    onchainVerified: false,
    basis: "topups",
    volumeNote: "reviewed program, not in the Oct 2026 volume ranking",
    advertisedCashbackLabel: "0%",
    effectiveAt1kPct: 0,
    netReturnDomesticPct: 0,
    netReturnForeignPct: 0,
    observedFxSpreadPct: 0,
    stakingBurdenLabel: "None",
  },
  {
    slug: "kosh",
    name: "Kosh",
    status: "live",
    custodyTier: 2,
    custodyNote: "stablecoin-collateralized Visa via Rain",
    paymentNetwork: "visa",
    issuer: "Rain",
    monthlyVolumeUsd: 0,
    allTimeVolumeUsd: 0,
    onchainVerified: false,
    basis: "topups",
    volumeNote: "reviewed program, not in the Oct 2026 volume ranking",
    rewardToken: "KOSH points",
    advertisedCashbackLabel: "1% base + campaigns",
    effectiveAt1kPct: 1.0,
    netReturnDomesticPct: -0.07,
    netReturnForeignPct: -2.07,
    stakingBurdenLabel: "None",
  },
  {
    slug: "revolut",
    name: "Revolut",
    cardSlug: "revolut-card",
    status: "live",
    custodyTier: 3,
    custodyNote: "custodial neobank — crypto-funded card spend",
    paymentNetwork: "visa_mastercard",
    issuer: "Revolut / Lead Bank",
    monthlyVolumeUsd: 0,
    allTimeVolumeUsd: 0,
    onchainVerified: false,
    basis: "topups",
    volumeNote: "reviewed program, not in the Oct 2026 volume ranking",
    advertisedCashbackLabel: "0% on crypto spend",
    effectiveAt1kPct: 0,
    netReturnDomesticPct: -0.18,
    netReturnForeignPct: -1.18,
    observedFxSpreadPct: 1.18,
    stakingBurdenLabel: "None",
  },
  {
    slug: "lava",
    name: "Lava",
    cardSlug: "lava-private",
    status: "live",
    custodyTier: 2,
    custodyNote: "7.5% APR Bitcoin line of credit",
    paymentNetwork: "visa",
    monthlyVolumeUsd: 0,
    allTimeVolumeUsd: 0,
    onchainVerified: false,
    basis: "spend",
    volumeNote: "audited in the best-cards comparison; not in the Oct volume ranking",
    rewardToken: "BTC",
    advertisedCashbackLabel: "3% (5% promos)",
    effectiveAt1kPct: 3.0,
    netReturnDomesticPct: 3.0,
    stakingBurdenLabel: "None",
  },
];

/* ------------------------------------------------------------------ */
/* Derived metrics                                                     */
/* ------------------------------------------------------------------ */

/** Annualized run-rate: monthly volume × 365/30 (the published convention). */
export function arr(entry: LeaderboardEntry): number {
  return (entry.monthlyVolumeUsd * 365) / 30;
}

export function avgTicketUsd(entry: LeaderboardEntry): number | undefined {
  if (!entry.monthlyTx || entry.monthlyTx === 0) return undefined;
  return entry.monthlyVolumeUsd / entry.monthlyTx;
}

export function txPerUser(entry: LeaderboardEntry): number | undefined {
  if (!entry.monthlyTx || !entry.monthlyActiveSpenders) return undefined;
  return entry.monthlyTx / entry.monthlyActiveSpenders;
}

export function arpuUsd(entry: LeaderboardEntry): number | undefined {
  if (!entry.monthlyActiveSpenders) return undefined;
  return entry.monthlyVolumeUsd / entry.monthlyActiveSpenders;
}

export function marketSharePct(entry: LeaderboardEntry): number {
  return (entry.monthlyVolumeUsd / ecosystem.monthlyVolumeUsd) * 100;
}

/** Empirical on-chain payout rate: on-chain cashback $ ÷ monthly spend $. */
export function onchainPayoutRatePct(entry: LeaderboardEntry): number | undefined {
  if (!entry.cashbackPaidUsd || entry.monthlyVolumeUsd === 0) return undefined;
  return (entry.cashbackPaidUsd / entry.monthlyVolumeUsd) * 100;
}

export type SpendPersona = "retail" | "wealth" | "neobank" | "unknown";

/**
 * Whale-vs-retail classification. Whale concentration can't be computed from
 * program-level aggregates, so the persona tag uses average ticket and ARPU.
 */
export function spendPersona(entry: LeaderboardEntry): SpendPersona {
  const ticket = avgTicketUsd(entry);
  const arpu = arpuUsd(entry);
  if (ticket !== undefined) {
    if (ticket <= 60) return "retail";
    if (ticket >= 100) return "wealth";
  }
  if (arpu !== undefined && arpu >= 5_000) return "wealth";
  if (entry.custodyTier === 3 || entry.basis === "topups") return "neobank";
  return "unknown";
}

export const personaLabel: Record<SpendPersona, string> = {
  retail: "Retail daily driver",
  wealth: "Wealth & corporate",
  neobank: "Neobank / top-up",
  unknown: "—",
};

export const custodyTierLabel: Record<CustodyTier, string> = {
  1: "Tier 1 · Smart account",
  2: "Tier 2 · DeFi collateral",
  3: "Tier 3 · Custodial",
};

/** Short custody pill for the master leaderboard column. */
export const custodyPillLabel: Record<CustodyTier, string> = {
  1: "Self-Custody",
  2: "DeFi Credit",
  3: "Custodial",
};

export const networkLabelShort: Record<NonNullable<LeaderboardEntry["paymentNetwork"]>, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  visa_mastercard: "Visa + MC",
};

/** The catalog card an entry links to, if any. */
export function catalogCard(entry: LeaderboardEntry) {
  return entry.cardSlug ? cardBySlug.get(entry.cardSlug) : undefined;
}

/* ------------------------------------------------------------------ */
/* Badges                                                              */
/* ------------------------------------------------------------------ */

export type BadgeAward = {
  slug: string;
  name: string;
  description: string;
  rule: string;
  winner: { name: string; detail: string; cardSlug?: string };
  runnerUp?: { name: string; detail: string; cardSlug?: string };
};

/**
 * Badge rules that are fully computable from the dataset run here; badges that
 * depend on qualitative audits (Zero-Friction, Global Explorer) are curated
 * from the source research, with the rule shown on the page.
 */
export function computeBadges(list: LeaderboardEntry[]): BadgeAward[] {
  const active = list.filter((e) => e.status === "live" && e.monthlyVolumeUsd > 0);

  /* Daily Driver: max tx/user where avg ticket $10–$55 and MAS ≥ 1,000. */
  const dailyDriverPool = active
    .filter((e) => {
      const ticket = avgTicketUsd(e);
      return (
        e.basis === "spend" &&
        ticket !== undefined && ticket >= 10 && ticket <= 55 &&
        (e.monthlyActiveSpenders ?? 0) >= 1_000
      );
    })
    .sort((a, b) => (txPerUser(b) ?? 0) - (txPerUser(a) ?? 0));
  const dd = dailyDriverPool[0];
  const dd2 = dailyDriverPool[1];

  /* Whale Magnet: max spend per address where monthly volume ≥ $5M —
     lifetime spend per address where address counts exist, else monthly ARPU. */
  const spendPerAddress = (e: LeaderboardEntry): number | undefined => {
    if (e.lifetimeAddresses) return e.allTimeVolumeUsd / e.lifetimeAddresses;
    return arpuUsd(e);
  };
  const whalePool = active
    .filter((e) => e.monthlyVolumeUsd >= 5_000_000 && spendPerAddress(e) !== undefined)
    .sort((a, b) => (spendPerAddress(b) ?? 0) - (spendPerAddress(a) ?? 0));
  const wm = whalePool[0];

  /* Breakout Sprinter: max 90d growth where volume ≥ $1M. */
  const sprinterPool = active
    .filter((e) => e.monthlyVolumeUsd >= 1_000_000 && e.growth90dPct !== undefined)
    .sort((a, b) => (b.growth90dPct ?? 0) - (a.growth90dPct ?? 0));
  const bs = sprinterPool[0];
  const bs2 = sprinterPool[1];

  /* Bankless Standard: max volume, custody tier 1 or 2, on-chain verified. */
  const banklessPool = active
    .filter((e) => (e.custodyTier === 1 || e.custodyTier === 2) && e.onchainVerified)
    .sort((a, b) => b.monthlyVolumeUsd - a.monthlyVolumeUsd);
  const bl = banklessPool[0];
  const blTier1 = banklessPool.find((e) => e.custodyTier === 1);

  const money = (n: number) => `$${(n / 1_000_000).toFixed(2)}M`;
  const entrySlug = (e?: LeaderboardEntry) => e?.cardSlug;

  return [
    {
      slug: "daily-driver",
      name: "The Daily Driver",
      description: "Highest transaction count per active user at a $10–$55 average ticket — the card people actually tap for coffee.",
      rule: "MAX(tx ÷ active spenders) WHERE basis=spend AND avg ticket $10–$55 AND spenders ≥ 1,000",
      winner: dd
        ? { name: dd.name, detail: `${(txPerUser(dd) ?? 0).toFixed(1)} tx/user at ~$${(avgTicketUsd(dd) ?? 0).toFixed(0)} ticket`, cardSlug: entrySlug(dd) }
        : { name: "—", detail: "insufficient per-program telemetry" },
      runnerUp: dd2
        ? { name: dd2.name, detail: `${(txPerUser(dd2) ?? 0).toFixed(1)} tx/user`, cardSlug: entrySlug(dd2) }
        : undefined,
    },
    {
      slug: "whale-magnet",
      name: "Whale Magnet",
      description: "Highest average monthly spend per active cardholder among programs clearing $5M+/mo.",
      rule: "MAX(volume ÷ active spenders) WHERE monthly volume ≥ $5M — lifetime spend per address where address counts exist",
      winner: wm
        ? { name: wm.name, detail: `~$${(spendPerAddress(wm) ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} per address`, cardSlug: entrySlug(wm) }
        : { name: "—", detail: "insufficient per-program telemetry" },
    },
    {
      slug: "zero-friction",
      name: "Zero-Friction Champion",
      description: "Lowest combined FX + top-up cost: 0% FX and 0% top-up in supported settlement currencies.",
      rule: "MIN(top-up fee + observed FX spread) WHERE annual fee = $0",
      winner: { name: "Gnosis Pay & UR Card (tie)", detail: "0% FX + 0% top-up on EURe/GBPe; 0% conversion across 7 fiat rails", cardSlug: "gnosis-pay" },
      runnerUp: { name: "ether.fi Cash", detail: "0% FX in USD & EUR", cardSlug: "etherfi-cash" },
    },
    {
      slug: "breakout-sprinter",
      name: "Breakout Sprinter",
      description: "Fastest 90-day volume expansion among programs clearing $1M+/mo.",
      rule: "MAX(90-day volume growth %) WHERE monthly volume ≥ $1M",
      winner: bs
        ? { name: bs.name, detail: `+${bs.growth90dPct?.toFixed(1)}% 90d to ${money(bs.monthlyVolumeUsd)}/mo`, cardSlug: entrySlug(bs) }
        : { name: "—", detail: "no qualifying program" },
      runnerUp: bs2
        ? { name: bs2.name, detail: `+${bs2.growth90dPct?.toFixed(1)}% 90d`, cardSlug: entrySlug(bs2) }
        : undefined,
    },
    {
      slug: "bankless-standard",
      name: "Bankless Standard",
      description: "Highest monthly volume on a self-custodial architecture — funds stay in the user's smart account or collateral vault until settlement.",
      rule: "MAX(volume) WHERE custody tier ∈ {1, 2} AND on-chain verified",
      winner: bl
        ? { name: bl.name, detail: `${money(bl.monthlyVolumeUsd)}/mo · ${money(bl.allTimeVolumeUsd)} all-time`, cardSlug: entrySlug(bl) }
        : { name: "—", detail: "no qualifying program" },
      runnerUp: blTier1
        ? { name: `${blTier1.name} (top Tier-1)`, detail: `${money(blTier1.monthlyVolumeUsd)}/mo`, cardSlug: entrySlug(blTier1) }
        : undefined,
    },
    {
      slug: "global-explorer",
      name: "Global Explorer",
      description: "Broadest geographic and multi-currency footprint — local settlement currencies plus virtual account rails.",
      rule: "MAX(local settlement currencies + virtual account rails), weighted by multi-chain deposits",
      winner: { name: "Wirex One", detail: "4 local card currencies (USD/EUR/GBP/AUD), dual USDC/EURC settlement, 11+ stablecoins", cardSlug: "wirex-one" },
      runnerUp: { name: "ether.fi & KAST", detail: "Bridge + Due/Noah virtual accounts across 12–20 fiat rails", cardSlug: "etherfi-cash" },
    },
  ];
}
