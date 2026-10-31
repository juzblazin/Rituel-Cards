import { cards, type Card } from "./data";
import { attributePages, cryptoPages, supportedCountries } from "./taxonomy";
import { absoluteUrl, site } from "./site";
import { getPosts } from "./blog";

const link = (title: string, path: string, note?: string) => `- [${title}](${absoluteUrl(path)})${note ? `: ${note}` : ""}`;

const byScore = [...cards].sort((a, b) => b.ratingScore - a.ratingScore);

function header(): string[] {
  return [
    `# ${site.name}`,
    "",
    `> ${site.name} is an independent comparison directory of ${cards.length} crypto debit, credit and prepaid cards. It lists each card's real fees, cashback, KYC level, custody model and country availability so people can pick the card that pays them most where they live.`,
    "",
    "Scores are editorial (0–10) and use the same fee, reward, custody and availability inputs for every card; sponsored placement never changes a score. Card data is re-verified against issuer sources, and each card page shows its last-verified date.",
    "",
  ];
}

async function blogSection(limit?: number): Promise<string[]> {
  const posts = await getPosts();
  if (posts.length === 0) return [];
  return ["## Blog", "", ...posts.slice(0, limit).map((post) => link(post.title, `/blog/${post.slug}`, post.excerpt)), ""];
}

export async function llmsTxt(): Promise<string> {
  return [
    ...header(),
    "## Core pages",
    "",
    link("Crypto card directory", "/", "every card with filters for fees, cashback, KYC and region"),
    link("Compare cards", "/compare", "side-by-side fee and feature comparisons"),
    link("Cards by country", "/countries", `availability in ${supportedCountries.length} countries`),
    link("Cards by crypto and chain", "/crypto", "which cards accept each token or network"),
    link("Methodology", "/methodology", "how cards are scored and verified"),
    link("List your card", "/submit-card", "for issuers"),
    "",
    "## Best-of guides",
    "",
    ...attributePages.map((page) => link(page.title, `/crypto-card/${page.slug}`, page.description)),
    "",
    "## Top-rated cards",
    "",
    ...byScore.slice(0, 20).map((card) => link(card.name, `/crypto-card/${card.slug}`, `${card.ratingScore}/10. ${card.tagline}`)),
    "",
    "## Cards by crypto",
    "",
    ...cryptoPages.map((page) => link(page.title, `/crypto/${page.slug}`)),
    "",
    ...(await blogSection(20)),
    "## Optional",
    "",
    link("Full card data for LLMs", "/llms-full.txt", "fees, rewards and availability for every card in Markdown"),
    link("Sitemap", "/sitemap.xml"),
    "",
  ].join("\n");
}

const pct = (value: number) => `${value}%`;
const usd = (value: number) => (value === 0 ? "Free" : `$${value}`);

function cardSection(card: Card): string[] {
  return [
    `### ${card.name}`,
    "",
    `${card.description}`,
    "",
    `- URL: ${absoluteUrl(`/crypto-card/${card.slug}`)}`,
    `- Issuer: ${card.issuerName} · Network: ${card.network} · Type: ${card.cardType}`,
    `- Rituel Cards score: ${card.ratingScore}/10`,
    `- Custody: ${card.custodyModel.replace("_", "-")} · KYC: ${card.kycLevel.replace("_", " ")}`,
    `- Cashback: ${card.cashbackMinPct === card.cashbackMaxPct ? pct(card.cashbackMaxPct) : `${pct(card.cashbackMinPct)}–${pct(card.cashbackMaxPct)}`} paid in ${card.payoutToken}${card.stakingRequirement && !/^none\b/i.test(card.stakingRequirement) ? ` (${card.stakingRequirement})` : ""}`,
    `- Fees: issuance ${usd(card.issuanceFeeUsd)}, annual ${usd(card.annualFeeUsd)}, top-up ${pct(card.topupFeePct)}, FX ${pct(card.fxFeePct)}`,
    `- Supported crypto: ${card.supportedCryptos.join(", ")}`,
    `- Chains: ${card.supportedChains.join(", ")}`,
    `- Available in: ${card.regionLabel}`,
    ...(card.lastVerifiedAt ? [`- Last verified: ${card.lastVerifiedAt}`] : []),
    "",
  ];
}

export async function llmsFullTxt(): Promise<string> {
  return [
    ...header(),
    "## Cards",
    "",
    ...byScore.flatMap(cardSection),
    ...(await blogSection()),
  ].join("\n");
}
