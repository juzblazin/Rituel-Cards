import type { Card } from "./data";

/**
 * Infrastructure providers (card-issuing rails / BIN sponsors) behind crypto
 * cards. `matches` lists the `issuerName` values found in the card data that
 * map to the provider. Generic placeholders (e.g. "Third National Bank",
 * "Regional Partner") are intentionally not mapped — there is nothing real to
 * explain about them.
 */
export type InfraProvider = {
  slug: string;
  name: string;
  /** What the provider is and what it does. */
  description: string;
  /** Regulatory licences / registrations, as publicly stated by the provider. */
  licenses: string;
  pros: string[];
  cons: string[];
  matches: string[];
};

export const infraProviders: InfraProvider[] = [
  {
    slug: "rain",
    name: "Rain",
    description:
      "Rain is a US-based stablecoin card-issuing platform that lets crypto wallets and neobanks launch cards settled directly from on-chain stablecoin balances. It sits between the wallet product and Visa, handling issuing, settlement and compliance plumbing so programmes can keep users self-custodied end to end.",
    licenses: "Visa principal member; operates under US money-transmission coverage via partner banks",
    pros: [
      "True on-chain settlement — stablecoin balance converts at spend time, not at top-up",
      "Self-custody friendly by design",
      "Fast programme launches (weeks, not months)",
    ],
    cons: [
      "Younger provider — a smaller track record than legacy EMIs",
      "Coverage and limits depend heavily on the partner programme",
      "Support goes through the card programme, not the rail",
    ],
    matches: ["Rain Cards", "Rain"],
  },
  {
    slug: "baanx",
    name: "Baanx (Crypto Life)",
    description:
      "Baanx is a UK crypto-card programme manager operating the 'Crypto Life' (CL) issuing stack. It provides the card programme, app plumbing and compliance layer that wallet brands like Ledger use to put a card in front of users without building issuing infrastructure themselves.",
    licenses: "FCA-registered cryptoasset business; issues under partner EMI licences",
    pros: [
      "Turn-key card programme — wallets can launch without their own licence",
      "Handles compliance, issuing and app plumbing end to end",
      "Proven with real products (the CL/Ledger card stack)",
    ],
    cons: [
      "Cards are branded 'CL' under the hood — the rail shows through",
      "Fee and feature control sits with Baanx, not the wallet brand",
      "Limited differentiation between programmes on the same stack",
    ],
    matches: ["Crypto Life (Baanx)", "Baanx"],
  },
  {
    slug: "monavate",
    name: "Monavate",
    description:
      "Monavate is a UK e-money institution and card-programme manager that has been one of the busiest BIN sponsors in crypto — its rails have sat behind a long list of wallet and exchange card launches, including high-profile self-custody cards.",
    licenses: "FCA-authorised e-money institution; EU issuance via UAB Monavate (Bank of Lithuania EMI)",
    pros: [
      "One of the most experienced crypto-card BIN sponsors",
      "Dual UK/EEA coverage through the Lithuanian entity",
      "Fast onboarding for new card programmes",
    ],
    cons: [
      "Smaller than tier-one EMIs — capacity and card ranges are finite",
      "Programme-level terms vary between cards on the same rail",
      "No direct consumer support — everything routes via the card brand",
    ],
    matches: ["UAB Monavate"],
  },
  {
    slug: "moorwand",
    name: "Moorwand",
    description:
      "Moorwand is a UK BIN sponsor and card-programme manager specialising in getting fintech and crypto card products to market quickly. It provides issuing, BIN ranges and scheme membership so partner brands don't need their own.",
    licenses: "FCA-authorised e-money institution",
    pros: [
      "Established crypto-friendly BIN sponsor",
      "Quick scheme access without the partner needing scheme membership",
      "Programme-management service, not just raw BIN rental",
    ],
    cons: [
      "Niche provider — smaller scale than large EMIs",
      "Feature depth depends on what the partner brand negotiates",
      "Limited public transparency on card terms",
    ],
    matches: ["Moorwand"],
  },
  {
    slug: "dipocket",
    name: "DiPocket",
    description:
      "DiPocket is a Lithuanian e-money institution that issues European payment and card products for fintechs and crypto programmes — best known in crypto as the EU issuer behind exchange cards like Bybit's.",
    licenses: "Bank of Lithuania EMI licence, passported across the EEA",
    pros: [
      "Real EU BIN ranges — cards behave like normal EEA debit cards",
      "Crypto-programme friendly onboarding history",
      "SEPA infrastructure for EUR-denominated spend",
    ],
    cons: [
      "EEA-focused — limited value outside Europe",
      "Smaller EMI, so programme features are partner-dependent",
      "Card terms (limits, ATM) set by the partner programme",
    ],
    matches: ["DiPocket UAB"],
  },
  {
    slug: "foris",
    name: "Foris DAX (Crypto.com)",
    description:
      "Foris DAX is Crypto.com's own issuing entity — the corporate rail the Crypto.com card programme runs on rather than a third-party BIN sponsor. That vertical integration is why the card's tier ladder, CRO lockups and app are so tightly coupled.",
    licenses: "Operates under partner-bank licences per region (Foris DAX Asia, Foris Inc. and EU entities)",
    pros: [
      "Deeply integrated with the Crypto.com app and token economy",
      "Large established programme with clear tier documentation",
      "Wide country coverage for a crypto programme",
    ],
    cons: [
      "Only powers Crypto.com — not a rail you can join from another product",
      "Cashback is denominated in CRO and tiered to lockups",
      "Regional terms (EEA vs US vs APAC) diverge significantly",
    ],
    matches: ["Foris DAX Asia"],
  },
  {
    slug: "monerium",
    name: "Monerium",
    description:
      "Monerium is an Icelandic e-money institution that issues EURe — regulated e-money directly on-chain. In card terms it is the rail that lets a card spend straight from a Safe or self-custody wallet: your EURe balance is the card balance, no custodial top-up needed.",
    licenses: "EMI licensed by the Icelandic FSA, passported across the EEA",
    pros: [
      "Genuine on-chain e-money — the card spends your wallet balance",
      "IBAN support means normal bank transfers fund the card",
      "Regulated e-money, not a wrapped stablecoin",
    ],
    cons: [
      "EURe liquidity and acceptance still a niche versus USDT/USDC",
      "Europe-focused — limited value for non-EU users",
      "On-chain settlement adds gas costs to top-ups",
    ],
    matches: ["Gnosis Safe / Monerium", "Monerium / Visa Partner"],
  },
  {
    slug: "unlimit",
    name: "Unlimit",
    description:
      "Unlimit is a global fintech offering card issuing, acquiring and payment infrastructure across multiple jurisdictions. In crypto it acts as the issuing rail for exchange and wallet card programmes that need multi-region coverage.",
    licenses: "FCA-authorised UK entity plus EEA licences (region-dependent)",
    pros: [
      "Broad multi-region licence coverage",
      "Full-stack: issuing plus acquiring under one roof",
      "Works with crypto programmes most banks reject",
    ],
    cons: [
      "Card features differ widely between programmes on the rail",
      "Little public documentation aimed at cardholders",
      "Support is always mediated by the front-end brand",
    ],
    matches: ["Unlimit"],
  },
  {
    slug: "modulr",
    name: "Modulr",
    description:
      "Modulr is a UK embedded-payments provider (banking-as-a-service) that supplies the account and card infrastructure behind fintech products, including some crypto-adjacent programmes needing real payment accounts.",
    licenses: "FCA-authorised e-money institution; EU operations via Modulr entities",
    pros: [
      "Real payment accounts, not just a card BIN",
      "Strong UK faster-payments integration",
      "Established BaaS provider with bank-grade compliance",
    ],
    cons: [
      "Not crypto-native — digital-asset programmes are a side use-case",
      "Stricter risk appetite than crypto-specialist rails",
      "Primarily UK/EEA focused",
    ],
    matches: ["Modulr"],
  },
  {
    slug: "pathward",
    name: "Pathward",
    description:
      "Pathward (formerly MetaBank) is a US sponsor bank that lends its charter to card programmes — it is the regulated bank actually issuing the card while the crypto brand provides the app and the funding mechanism.",
    licenses: "FDIC-insured national bank",
    pros: [
      "Full US banking charter behind the card",
      "Deep experience sponsoring fintech and crypto card programmes",
      "US cards behave like normal US debit/credit cards",
    ],
    cons: [
      "US-only coverage",
      "Programme terms are set by the front-end partner",
      "Crypto features depend entirely on the partner, not the bank",
    ],
    matches: ["Pathward N.A."],
  },
  {
    slug: "webbank",
    name: "WebBank",
    description:
      "WebBank is a Utah-chartered industrial bank that issues consumer fintech cards — it is the regulated issuer behind products like the Gemini Credit Card, while the crypto platform supplies the rewards and the app.",
    licenses: "FDIC-insured Utah-chartered industrial bank",
    pros: [
      "Regulated US issuer with real credit-card experience",
      "Enables actual credit products, not just prepaid/debit",
      "Familiar underwriting and rewards-card mechanics",
    ],
    cons: [
      "US-only",
      "Credit products require standard credit checks and KYC",
      "The crypto layer is entirely the partner's responsibility",
    ],
    matches: ["WebBank"],
  },
  {
    slug: "comenity",
    name: "Comenity Capital Bank",
    description:
      "Comenity Capital Bank is a US card-issuing bank best known for branded and co-branded consumer credit-card programmes — the issuing partner when a crypto platform wants a full-featured credit card rather than a prepaid product.",
    licenses: "FDIC-insured bank",
    pros: [
      "Full-featured US credit-card issuing (rewards, statements, APR)",
      "Co-branded programme experience at scale",
      "Established underwriting infrastructure",
    ],
    cons: [
      "Credit approval required — not accessible to everyone",
      "US market only",
      "Conventional bank terms, not crypto-native features",
    ],
    matches: ["Comenity Capital Bank"],
  },
  {
    slug: "lead-bank",
    name: "Lead Bank",
    description:
      "Lead Bank is a Kansas community bank that sponsors banking and card programmes for fintechs — the charter behind several US crypto and neobank card products that need an FDIC-insured issuer.",
    licenses: "FDIC-insured state-chartered bank",
    pros: [
      "Real US bank charter, so cards are normal US bank cards",
      "Fintech-friendly sponsor-bank posture",
      "Used by established crypto-adjacent programmes",
    ],
    cons: [
      "US-only footprint",
      "Card features are the partner's design, not the bank's",
      "Smaller bank — capacity for new programmes is finite",
    ],
    matches: ["Lead Bank", "Revolut Bank / Lead Bank"],
  },
  {
    slug: "contis",
    name: "Contis",
    description:
      "Contis (UAB Finansinės paslaugos 'Contis') is a UK/Lithuanian e-money institution that for years was the actual issuer behind Wirex's European card programme — the classic example of the invisible rail behind a consumer crypto card.",
    licenses: "Bank of Lithuania EMI; FCA-registered UK entity",
    pros: [
      "Long crypto-card track record — issued Wirex EU cards for years",
      "Dual UK/EEA coverage",
      "Mature programme-management infrastructure",
    ],
    cons: [
      "Programmes on the rail share similar fee structures",
      "Issuer-level outages affect every card on the rail at once",
      "Opaque to cardholders — no direct consumer relationship",
    ],
    matches: ["Contis / Wirex Ltd"],
  },
  {
    slug: "interlace-money",
    name: "Interlace Money",
    description:
      "Interlace Money is a card-issuing and payments-infrastructure provider that crypto programmes use as their regulated rail — the licence behind the card while the brand supplies the app and the crypto layer.",
    licenses: "Operates under EMI/partner licences (region-dependent)",
    pros: [
      "Accepts crypto-native programmes most EMIs decline",
      "Full issuing stack under the partner's brand",
      "Used by self-custody card programmes",
    ],
    cons: [
      "Limited public documentation for cardholders",
      "Small provider — programme capacity is constrained",
      "Terms vary per partner product",
    ],
    matches: ["Interlace Money"],
  },
];

export const infraBySlug = new Map(infraProviders.map((p) => [p.slug, p]));

export function cardsOnRail(provider: InfraProvider, all: Card[]): Card[] {
  return all.filter((card) => provider.matches.includes(card.issuerName));
}
