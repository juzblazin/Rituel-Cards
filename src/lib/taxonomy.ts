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
  {
    slug: "btc",
    label: "BTC",
    kind: "token",
    symbol: "BTC",
    title: "Best Bitcoin (BTC) Crypto Cards in 2026",
    heading: "Bitcoin (BTC) crypto cards",
    description: "Compare crypto cards that let you spend or top up with Bitcoin (BTC). Fees, cashback, conversion and country availability.",
    intro: "Bitcoin-funded cards range from custodial exchange products to hardware-wallet-native spending. Compare how each programme handles BTC top-ups and conversion.",
    filter: (card) => card.supportedCryptos.includes("BTC") || card.supportedChains.includes("Bitcoin"),
  },
  tokenPage("eth", "ETH", "Ether", "Cards that let you spend native ETH directly — often settling on L2s to keep gas costs down. Compare conversion fees and cashback."),
  tokenPage("sol", "SOL", "SOL (Solana token)", "Cards that accept native SOL as a spending asset, without converting to a stablecoin first."),
  tokenPage("monero", "XMR", "Monero", "Monero support is rare in the card market. These are the few programmes that accept XMR, plus the privacy trade-offs to know."),
  tokenPage("eure", "EURe", "EURe", "EURe is Monerium's e-money token. Gnosis Pay is the main card programme that settles in EURe for zero-FX European spend."),
  {
    slug: "ethereum",
    label: "Ethereum",
    kind: "chain",
    title: "Best Ethereum Network (ERC-20) Crypto Cards in 2026",
    heading: "Ethereum network (ERC-20) crypto cards",
    description: "Crypto debit and credit cards that settle on Ethereum mainnet for ERC-20 stablecoin and token top-ups. Compare fees, cashback and availability.",
    intro: "Ethereum mainnet is the widest settlement layer for ERC-20 USDC, USDT and DAI card top-ups, though many programmes also offer L2s for lower gas.",
    filter: (card) => card.supportedChains.includes("Ethereum"),
  },
  {
    slug: "solana",
    label: "Solana",
    kind: "chain",
    title: "Best Solana Network (SPL) Crypto Cards in 2026",
    heading: "Solana network (SPL) crypto cards",
    description: "Crypto cards that support the Solana network for cheap SPL USDC, USDT and token top-ups. Compare fees, cashback and country availability.",
    intro: "Solana's sub-cent fees make it one of the fastest chains for SPL stablecoin and token card top-ups.",
    filter: (card) => card.supportedChains.includes("Solana"),
  },
  chainPage("arbitrum", "Arbitrum", "Arbitrum is the most common L2 for stablecoin top-ups, with low fees and broad exchange support."),
  chainPage("base", "Base", "Base has become the preferred chain for USDC top-ups thanks to cheap transfers and Coinbase integration."),
  chainPage("polygon", "Polygon", "Polygon remains widely supported for USDC and USDT top-ups, particularly among older card programmes."),
  chainPage("tron", "Tron", "Tron is the cheapest route for USDT top-ups at many custodial card issuers, especially in Asia."),
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

/**
 * Canonical slug for a comparison. Slugs are sorted so `a-vs-b` and `b-vs-a`
 * resolve to one URL instead of competing as duplicates.
 */
export function compareSlug(...slugs: string[]): string {
  return [...slugs].sort().join("-vs-");
}

export const featuredPairs = featuredPairSeeds
  .map(([a, b]) => {
    const cardA = cards.find((card) => card.slug === a);
    const cardB = cards.find((card) => card.slug === b);
    return cardA && cardB ? { a: cardA, b: cardB, slug: compareSlug(a, b) } : null;
  })
  .filter((pair): pair is { a: Card; b: Card; slug: string } => Boolean(pair));

export const allCountryCodes = countries.map((c) => c.code);

export type BestPage = {
  /** Category key — the URL is /best/{slug}-crypto-cards. */
  slug: string;
  /** Primary query the page targets. */
  keyword: string;
  title: string;
  heading: string;
  description: string;
  /** Primer on why standard exchange cards fail in this category. */
  intro: string;
  filter: (card: Card) => boolean;
  faqs: { q: string; a: string }[];
};

const DEFI_COLLATERAL_SLUGS = new Set([
  "exa-card",
  "avalanche-card",
  "ethena-pay",
  "etherfi-cash",
  "etherfi-cash-luxe",
  "lava-private",
  "solidyield",
]);

const STABLECOINS = new Set(["USDT", "USDC", "DAI", "EURC", "EURe", "USDG", "mUSD"]);

export const bestPages: BestPage[] = [
  {
    slug: "self-custody",
    keyword: "best self custody crypto cards",
    title: "Best Self-Custody Crypto Cards in 2026",
    heading: "Best self-custody crypto cards",
    description:
      "Compare the best self-custody crypto cards that let you spend on-chain without handing your keys to an exchange. Fees, cashback, KYC and limits compared.",
    intro:
      "Exchange cards hold your funds the way a bank does — if the issuer freezes your account or fails, your balance goes with it. Self-custody cards settle straight from your wallet or smart account, so you keep control of the keys until the moment you spend. These are the cards that actually deliver that.",
    filter: (card) => card.custodyModel === "self_custody",
    faqs: [
      { q: "What is a self-custody crypto card?", a: "A self-custody crypto card spends directly from a wallet or smart account you control, rather than a custodial balance held by an exchange. The issuer can process the payment but cannot freeze or seize your underlying funds." },
      { q: "Do self-custody cards require KYC?", a: "Most do for the card application itself, because card networks require it — but your crypto stays in your own wallet. A few virtual-only programmes issue cards with email-only or light verification, usually with lower limits." },
      { q: "What are the downsides of self-custody cards?", a: "You pay the gas or network fee on each top-up or spend, settlement can take seconds rather than being instant, and recovering a lost wallet is your own responsibility — there is no support line that can restore access." },
    ],
  },
  {
    slug: "travel",
    keyword: "zero fx fee crypto travel card",
    title: "Best Zero-FX Crypto Travel Cards in 2026",
    heading: "Best zero-FX crypto travel cards",
    description:
      "The best crypto travel cards with 0% foreign exchange fees: spend abroad without the 2-3% FX markup, plus ATM, wallet and country coverage compared.",
    intro:
      "The classic travel trap: your card advertises 'no annual fee' and quietly charges 2-3% on every foreign transaction. Exchange cards are worse — many stack an FX fee on top of a crypto conversion spread. The cards here charge no FX markup at all, which is the difference between a good trip and an expensive one.",
    filter: (card) => card.fxFeePct === 0,
    faqs: [
      { q: "What does zero-FX mean on a crypto card?", a: "The issuer does not add a foreign-exchange markup when you spend in a currency other than your card's base currency. You may still pay a small network or conversion spread — check the top-up and conversion fees column on each card." },
      { q: "Are zero-FX crypto cards good for travel?", a: "Yes — a 0% FX fee saves roughly $30 per $1,000 spent abroad versus a typical 3% card. Pair it with a card that has a free ATM allowance and mobile wallet support for the best travel experience." },
      { q: "Do zero-FX cards work in every country?", a: "Not necessarily. Each card has a list of supported regions and excluded countries — check the availability column, and keep a backup card for destinations where crypto cards aren't issued." },
    ],
  },
  {
    slug: "defi-collateral",
    keyword: "defi collateral crypto spending cards",
    title: "Best DeFi Collateral Crypto Spending Cards in 2026",
    heading: "Best DeFi collateral crypto spending cards",
    description:
      "Compare DeFi collateral crypto cards that let you spend against your on-chain collateral without selling. LTV, liquidation rules, fees and rewards compared.",
    intro:
      "Selling crypto to pay for groceries creates a taxable event and kills your position. Collateralized spending cards borrow against your on-chain assets — BTC, ETH, stablecoins — so you keep the upside while you spend. The catch: liquidation risk. These are the programmes that handle it well.",
    filter: (card) => DEFI_COLLATERAL_SLUGS.has(card.slug),
    faqs: [
      { q: "How do DeFi collateral cards work?", a: "You lock collateral (BTC, ETH or stablecoins) in a smart contract or lending position. The card spends against a credit line backed by that collateral — you repay later, and your crypto position stays intact." },
      { q: "What happens if my collateral drops in value?", a: "If the loan-to-value ratio breaches the liquidation threshold, part of your collateral is sold to cover the debt. Choose programmes with conservative LTVs and top up collateral during volatility." },
      { q: "Is spending collateral a taxable event?", a: "In most jurisdictions borrowing is not a taxable disposal — which is the point. Tax treatment varies by country though, so confirm with a local adviser before relying on it." },
    ],
  },
  {
    slug: "no-kyc",
    keyword: "best no kyc crypto cards",
    title: "Best No-KYC Crypto Cards in 2026",
    heading: "Best no-KYC crypto cards",
    description:
      "Compare the best no-KYC crypto cards you can get without identity verification — real limits, fees, funding options and the trade-offs you should know.",
    intro:
      "Every mainstream exchange card runs full KYC — passport, selfie, proof of address — before it issues anything. A small set of programmes still issue cards on email or wallet verification alone, usually as virtual cards with capped limits. These are the legitimate options left.",
    filter: (card) => card.kycLevel === "no_kyc",
    faqs: [
      { q: "Are no-KYC crypto cards legal?", a: "Yes for the user in most countries — the compliance burden sits with the issuer, which is why anonymous cards usually carry low limits and stricter terms. Very high-limit 'no-KYC' offers are a red flag." },
      { q: "What limits should I expect without KYC?", a: "Typically a few hundred dollars per transaction and low four figures per month. Programmes lift limits progressively if you later complete identity verification." },
      { q: "Why did my no-KYC card get declined?", a: "Common causes: the merchant doesn't accept prepaid virtual cards, the card exceeded its no-KYC limit, or the issuer added a verification requirement — policies in this category change often." },
    ],
  },
  {
    slug: "high-cashback",
    keyword: "best high cashback crypto cards",
    title: "Best High-Cashback Crypto Cards in 2026",
    heading: "Best high-cashback crypto cards",
    description:
      "Compare crypto cards paying 3%+ cashback. Real reward rates, caps, token requirements and which programmes actually pay out — updated for 2026.",
    intro:
      "Cashback marketing inflates fast: 'up to 10%' usually means a top tier behind a six-figure token lockup, or a promo rate that caps at $20 a month. This list filters to cards paying 3% or more at attainable tiers — and the table shows the cap that actually applies.",
    filter: (card) => card.cashbackMaxPct >= 3,
    faqs: [
      { q: "What is a realistic cashback rate on a crypto card?", a: "1-3% at free tiers, 3-5% behind token lockups or paid plans, and anything above that on promotional or very high tiers. The cap matters more than the headline rate." },
      { q: "Are crypto card cashback rewards taxable?", a: "In many jurisdictions, card cashback is treated as a rebate (not taxable income) — but rewards paid in tokens can trigger capital gains when you sell them. Local rules vary." },
      { q: "Why is the advertised cashback rate different from what I get?", a: "Headline rates almost always assume the top tier, a promo period, or uncapped marketing math. Monthly caps, eligible-merchant rules and token lockups decide what you actually earn — check the cap column." },
    ],
  },
  {
    slug: "stablecoin",
    keyword: "best stablecoin crypto cards",
    title: "Best Stablecoin Crypto Cards in 2026",
    heading: "Best stablecoin crypto cards",
    description:
      "Compare crypto cards you can top up and spend with USDT, USDC and other stablecoins — no volatility risk, low fees, wide country coverage.",
    intro:
      "Spending volatile crypto means tracking a tax event on every coffee. Stablecoin-funded cards skip that: top up in USDT or USDC, spend fiat at the point of sale, keep one clean ledger. The cards here all accept major stablecoins directly.",
    filter: (card) => card.supportedCryptos.some((crypto) => STABLECOINS.has(crypto)),
    faqs: [
      { q: "Which stablecoins do crypto cards support?", a: "USDT and USDC are supported almost everywhere. Some self-custody cards also take DAI, EURe, USDG or issuer-specific dollars like mUSD — the table shows each card's top-up assets." },
      { q: "Are there fees for topping up with stablecoins?", a: "Usually a 0-1% conversion or load fee, plus network gas for self-custody cards. Exchange-issued cards often waive the load fee but take it in the FX spread." },
      { q: "Is spending stablecoins a taxable event?", a: "Spending stablecoins is still a disposal in many jurisdictions, but the gain is typically near zero — which is why people use them for spend instead of BTC or ETH." },
    ],
  },
  {
    slug: "business",
    keyword: "best business crypto cards",
    title: "Best Business Crypto Cards in 2026",
    heading: "Best business crypto cards",
    description:
      "Compare business crypto cards for companies: KYB requirements, team cards, spend limits, accounting features and which programmes accept business entities.",
    intro:
      "Most crypto cards are personal products — apply with a company wallet and you're in breach of terms. Business programmes run KYB (company documents, UBO verification) and add team cards, spend controls and proper accounting. These are the ones that actually support companies.",
    filter: (card) => card.audience === "business" || card.audience === "both",
    faqs: [
      { q: "What is KYB and how is it different from KYC?", a: "KYB (know-your-business) verifies the company entity — registration documents, directors, ultimate beneficial owners — rather than an individual. It takes days, not minutes." },
      { q: "Can I use a personal crypto card for business spending?", a: "Technically sometimes, but it usually violates the card's terms of service and creates accounting problems. Business programmes exist precisely because personal cards prohibit it." },
      { q: "Do business crypto cards support multiple team members?", a: "The good ones issue additional virtual or physical cards per employee with per-card spend limits — check the programme's team features before applying." },
    ],
  },
  {
    slug: "apple-pay",
    keyword: "best apple pay crypto cards",
    title: "Best Apple Pay Crypto Cards in 2026",
    heading: "Best Apple Pay crypto cards",
    description:
      "Crypto cards that work with Apple Pay: tap-to-pay from your crypto balance. Compare which programmes support Apple Wallet, fees and card types.",
    intro:
      "A crypto card you can't tap is half a card. Apple Pay support turns a virtual card into something you can actually use day-to-day — and it's also the tell for whether the issuer is a serious programme or a paper wallet with a Visa logo. These cards all support Apple Wallet.",
    filter: (card) => card.mobileWallets.includes("apple_pay"),
    faqs: [
      { q: "How do I add a crypto card to Apple Pay?", a: "Open the issuer's app, find the card screen, and tap 'Add to Apple Wallet'. Some programmes let you add it from the Wallet app directly using the card details." },
      { q: "Does Apple Pay work with virtual crypto cards?", a: "Yes — that's the main point. Most programmes issue the virtual card instantly and you can be tapping within minutes of approval, long before any physical card arrives." },
      { q: "Are there fees for paying with Apple Pay?", a: "No extra fees from Apple or the card — you pay the same FX and conversion fees as a normal card transaction." },
    ],
  },
];

export const bestBySlug = new Map(bestPages.map((page) => [page.slug, page]));

/** Best-page route param: '/best/self-custody-crypto-cards' -> 'self-custody'. */
export function bestPageFromSlug(slug: string): BestPage | undefined {
  const suffix = "-crypto-cards";
  if (!slug.endsWith(suffix)) return undefined;
  return bestBySlug.get(slug.slice(0, -suffix.length));
}
