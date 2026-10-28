import { cards, type Card } from "./data";
import { countries, countryByCode, countryBySlug } from "./countries";

/* ------------------------------------------------------------------ */
/* Attribute hubs: /cards/[attribute]                                  */
/* ------------------------------------------------------------------ */

export type AttributePage = {
  slug: string;
  eyebrow: string;
  title: string;
  heading: string;
  description: string;
  intro: string;
  filter: (card: Card) => boolean;
};

const STABLECOIN_SYMBOLS = new Set(["USDC", "USDT", "EURe"]);

export const attributePages: AttributePage[] = [
  {
    slug: "no-kyc",
    eyebrow: "Privacy",
    title: "Best No-KYC Crypto Cards in 2026",
    heading: "No-KYC crypto cards",
    description:
      "Crypto cards you can open with minimal or no identity verification. Compare limits, fees and country availability.",
    intro:
      "These cards offer a no-KYC onboarding tier, usually capped at a low monthly spend. Above the cap you will still need to verify your identity — treat the tier as a trial, not a loophole.",
    filter: (card) => card.kycLevel === "no_kyc",
  },
  {
    slug: "self-custody",
    eyebrow: "Custody",
    title: "Best Self-Custody Crypto Cards in 2026",
    heading: "Self-custody crypto cards",
    description:
      "Spend from a wallet you control. Compare non-custodial crypto cards on FX, cashback, chains and country support.",
    intro:
      "Self-custody cards keep your assets in your own wallet until the moment of settlement. The trade-off is usually lighter rewards and a more involved onboarding flow.",
    filter: (card) => card.custodyModel === "self_custody",
  },
  {
    slug: "apple-pay",
    eyebrow: "Mobile wallets",
    title: "Crypto Cards with Apple Pay (2026)",
    heading: "Crypto cards with Apple Pay",
    description:
      "Every crypto card that supports Apple Pay, ranked by fees, cashback and real country availability.",
    intro:
      "Apple Pay support is now table stakes for virtual cards. All of the cards below can be added to Apple Wallet and used for contactless payments.",
    filter: (card) => card.mobileWallets.includes("apple_pay"),
  },
  {
    slug: "google-pay",
    eyebrow: "Mobile wallets",
    title: "Crypto Cards with Google Pay (2026)",
    heading: "Crypto cards with Google Pay",
    description:
      "Crypto debit and prepaid cards that work with Google Wallet, compared on fees and rewards.",
    intro:
      "Google Pay support varies by region even within the same card programme. Check the issuer's local availability before applying.",
    filter: (card) => card.mobileWallets.includes("google_pay"),
  },
  {
    slug: "virtual-ad-spend",
    eyebrow: "Business",
    title: "Best Crypto Cards for Ad Spend & Virtual Cards",
    heading: "Crypto cards for ad spend",
    description:
      "Virtual crypto cards for Facebook, Google and TikTok ads. Compare limits, top-up fees and ad-platform acceptance.",
    intro:
      "Ad platforms are strict about card BINs and issuer history. These cards are the most commonly reported to work for Meta and Google Ads, often with instant virtual issuance.",
    filter: (card) => card.hasVirtual && (card.audience === "business" || card.audience === "both"),
  },
  {
    slug: "high-cashback",
    eyebrow: "Rewards",
    title: "Highest Cashback Crypto Cards in 2026",
    heading: "High-cashback crypto cards",
    description:
      "Crypto cards with the highest cashback rates, plus the staking requirements and caps behind the headline numbers.",
    intro:
      "Headline cashback rates usually hide a stake requirement, a monthly cap or a token that can fall in price. We show all three so you can judge the real return.",
    filter: (card) => card.cashbackMaxPct >= 3,
  },
  {
    slug: "stablecoin",
    eyebrow: "Stablecoin",
    title: "Best Stablecoin Crypto Cards in 2026",
    heading: "Stablecoin crypto cards",
    description:
      "Crypto cards that accept USDC, USDT, EURe and other dollar-pegged assets. Compare top-up fees, cashback and FX.",
    intro:
      "Stablecoin cards keep your spend balance pegged to a fiat currency, so a market move never changes what the card can buy. Almost every programme now funds from USDC or USDT; the differences are in top-up fees, chain support and how cashback is paid.",
    filter: (card) => card.supportedCryptos.some((symbol) => STABLECOIN_SYMBOLS.has(symbol)),
  },
  {
    slug: "no-fx",
    eyebrow: "Fees",
    title: "Crypto Cards with 0% FX Fees (2026)",
    heading: "Zero FX fee crypto cards",
    description:
      "Crypto cards with no foreign exchange markup. Compare weekend spreads, ATM fees and currency support.",
    intro:
      "A 0% FX headline can still hide a weekend markup or a bad mid-market rate. These cards publish a genuine 0% policy on foreign spend.",
    filter: (card) => card.fxFeePct === 0,
  },
  {
    slug: "business",
    eyebrow: "Business",
    title: "Best Crypto Cards for Businesses in 2026",
    heading: "Crypto cards for business",
    description:
      "Business and ad-spend crypto cards with virtual issuance, higher limits and multi-user support.",
    intro:
      "Business crypto cards are judged on limits, expense controls and whether finance teams can reconcile on-chain top-ups. Here are the strongest options.",
    filter: (card) => card.audience === "business" || card.audience === "both",
  },
  {
    slug: "virtual-cards",
    eyebrow: "Card form",
    title: "Best Virtual Crypto Cards in 2026",
    heading: "Virtual crypto cards",
    description: "Instant-issuance virtual crypto cards for online spend, subscriptions and ads.",
    intro:
      "Virtual cards are issued in minutes and can be frozen after each merchant. These are the best options for online-only spend.",
    filter: (card) => card.hasVirtual,
  },
  {
    slug: "physical-cards",
    eyebrow: "Card form",
    title: "Best Physical Crypto Cards in 2026",
    heading: "Physical crypto cards",
    description: "Crypto cards you can hold, tap and withdraw cash from at an ATM.",
    intro:
      "Physical cards still matter for ATM withdrawals, travel and merchants that do not accept contactless. These programmes ship a real card.",
    filter: (card) => card.hasPhysical,
  },
  {
    slug: "light-kyc",
    eyebrow: "Privacy",
    title: "Best Light-KYC Crypto Cards in 2026",
    heading: "Light-KYC crypto cards",
    description:
      "Crypto cards with simplified onboarding — usually an ID and a selfie rather than proof of address.",
    intro:
      "Light KYC usually means a government ID and a liveness check, with no proof of address or source-of-funds review at low limits.",
    filter: (card) => card.kycLevel === "light_kyc",
  },
  {
    slug: "zero-annual-fee",
    eyebrow: "Fees",
    title: "Crypto Cards With No Annual Fee (2026)",
    heading: "No annual fee crypto cards",
    description: "Every crypto card with a $0 annual fee, ranked by cashback and FX cost.",
    intro:
      "Annual fees are rare in crypto cards, but some premium tiers still charge them. Every card below is free to hold year-round.",
    filter: (card) => card.annualFeeUsd === 0,
  },
];

export const attributeBySlug = new Map(attributePages.map((page) => [page.slug, page]));

/* ------------------------------------------------------------------ */
/* Token & chain hubs: /crypto/[token]                                 */
/* ------------------------------------------------------------------ */

export type CryptoPage = {
  slug: string;
  label: string;
  kind: "token" | "chain";
  symbol?: string;
  title: string;
  heading: string;
  description: string;
  intro: string;
  filter: (card: Card) => boolean;
};

function tokenPage(slug: string, symbol: string, name: string, intro: string): CryptoPage {
  return {
    slug,
    label: symbol,
    kind: "token",
    symbol,
    title: `Best Crypto Cards That Support ${name} (${symbol}) in 2026`,
    heading: `Crypto cards that support ${name}`,
    description: `Compare crypto cards that let you spend ${symbol}. Fees, cashback, supported chains and country availability.`,
    intro,
    filter: (card) => card.supportedCryptos.includes(symbol),
  };
}

function chainPage(slug: string, chain: string, intro: string): CryptoPage {
  return {
    slug,
    label: chain,
    kind: "chain",
    title: `Best Crypto Cards on ${chain} in 2026`,
    heading: `Crypto cards on ${chain}`,
    description: `Crypto debit and credit cards that support ${chain}. Compare top-up fees, cashback and country availability.`,
    intro,
    filter: (card) => card.supportedChains.includes(chain),
  };
}

export const cryptoPages: CryptoPage[] = [
  tokenPage("usdt", "USDT", "Tether", "USDT is the most widely supported stablecoin in the category. These cards let you top up from Tron, Ethereum, BNB Chain and more."),
  tokenPage("usdc", "USDC", "USD Coin", "USDC is the stablecoin of choice for DeFi-native cards, especially on Base and Arbitrum where transfers cost cents."),
  tokenPage("btc", "BTC", "Bitcoin", "Bitcoin-funded cards range from custodial exchange products to hardware-wallet-native spending. Compare how each handles conversion."),
  tokenPage("eth", "ETH", "Ethereum", "Ether-funded cards often settle on L2s to keep gas costs down. Here is what each programme supports."),
  tokenPage("sol", "SOL", "Solana", "Solana-native cards are finally arriving. Compare the programmes that accept SOL directly, without a wrapped asset."),
  tokenPage("monero", "XMR", "Monero", "Monero support is rare in the card market. These are the few programmes that accept XMR, plus the privacy trade-offs to know."),
  tokenPage("eure", "EURe", "EURe", "EURe is Monerium's e-money token. Gnosis Pay is the main card programme that settles in EURe for zero-FX European spend."),
  chainPage("ethereum", "Ethereum", "Ethereum is the default settlement layer for most crypto cards, though many now support L2s to reduce top-up costs."),
  chainPage("solana", "Solana", "Solana's low fees make it attractive for card top-ups. These programmes accept SOL or SPL stablecoins."),
  chainPage("arbitrum", "Arbitrum", "Arbitrum is the most common L2 for stablecoin top-ups, with low fees and broad exchange support."),
  chainPage("base", "Base", "Base has become the preferred chain for USDC top-ups thanks to cheap transfers and Coinbase integration."),
  chainPage("polygon", "Polygon", "Polygon remains widely supported for USDC and USDT top-ups, particularly among older card programmes."),
  chainPage("tron", "Tron", "Tron is the cheapest route for USDT top-ups at many custodial card issuers, especially in Asia."),
  chainPage("bitcoin", "Bitcoin", "Bitcoin-funded cards either convert on spend or require a pre-funded fiat balance. Fees vary widely."),
  chainPage("gnosis", "Gnosis", "Gnosis Chain is the home of EURe and Gnosis Pay, and one of the cheapest places to settle card spend on-chain."),
  chainPage("bnb-chain", "BNB Chain", "BNB Chain support is common among exchange-issued cards, with low top-up fees for USDT and BUSD-era assets."),
];

export const cryptoBySlug = new Map(cryptoPages.map((page) => [page.slug, page]));

/* ------------------------------------------------------------------ */
/* Country helpers                                                     */
/* ------------------------------------------------------------------ */

export const supportedCountryCodes = Array.from(
  new Set(cards.flatMap((card) => card.supportedCountries)),
).sort();

export const supportedCountries = supportedCountryCodes
  .map((code) => countryByCode.get(code))
  .filter((country): country is NonNullable<typeof country> => Boolean(country));

export function cardsForCountry(code: string): Card[] {
  return cards.filter((card) => card.supportedCountries.includes(code));
}

export function countryPageTitle(countryName: string): string {
  return `Best Crypto Cards in ${countryName} (2026)`;
}

export function countryFromSlug(slug: string) {
  return countryBySlug.get(slug);
}

export function flagFor(code: string | undefined): string {
  if (!code || code === "ALL") return "🌍";
  return countryByCode.get(code)?.flag ?? "🌍";
}

export function countryName(code: string | undefined): string {
  if (!code || code === "ALL") return "All countries";
  return countryByCode.get(code)?.name ?? "All countries";
}

/* ------------------------------------------------------------------ */
/* Comparison pairs                                                    */
/* ------------------------------------------------------------------ */

const featuredPairSeeds = [
  ["etherfi-cash", "gnosis-pay"],
  ["etherfi-cash", "crypto-com-visa"],
  ["etherfi-cash", "nexo-card"],
  ["gnosis-pay", "crypto-com-visa"],
  ["gnosis-pay", "wirex-card"],
  ["redotpay", "kast"],
  ["redotpay", "bitget-card"],
  ["crypto-com-visa", "nexo-card"],
  ["crypto-com-visa", "coinbase-card"],
  ["nexo-card", "gemini-credit-card"],
  ["bybit-card", "bitget-card"],
  ["kraken-card", "coinbase-card"],
  ["plutus-card", "wirex-card"],
  ["metamask-card", "ledger-live-card"],
  ["bleap", "holyheld"],
  ["etherfi-cash", "metamask-card"],
  ["shakepay-card", "coinjar-card"],
  ["bitpay-card", "fold-card"],
  ["dolarapp", "kast"],
  ["deblock", "bleap"],
  ["okx-card", "bleap"],
  ["coinbase-card", "gemini-credit-card"],
  ["etherfi-cash", "kraken-card"],
  ["nexo-card", "kast"],
  ["wirex-card", "deblock"],
];

export const featuredPairs = featuredPairSeeds
  .map(([a, b]) => {
    const cardA = cards.find((card) => card.slug === a);
    const cardB = cards.find((card) => card.slug === b);
    return cardA && cardB ? { a: cardA, b: cardB, slug: `${a}-vs-${b}` } : null;
  })
  .filter((pair): pair is { a: Card; b: Card; slug: string } => Boolean(pair));

export const allCountryCodes = countries.map((c) => c.code);
