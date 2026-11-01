// Seeds the four blog pillar categories and assigns posts to them.
// Usage: node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/blog-pillars.mts
// Pillar order is also hardcoded in src/lib/blog.ts (pillarOrder) — keep in sync.
// Needs SANITY_WRITE_TOKEN (Editor) — loaded from .env.local via scripts/env.mts.
import { createClient } from "@sanity/client";
import { loadEnv } from "./env.mts";

loadEnv();

const token = process.env.SANITY_WRITE_TOKEN?.trim();
if (!token) {
  console.error("Requires SANITY_WRITE_TOKEN.");
  process.exit(1);
}

const sanity = createClient({ projectId: "uzbgef9r", dataset: "production", apiVersion: "2025-01-01", token, useCdn: false });

const PILLARS = [
  {
    _id: "category-defi",
    title: "DeFi",
    slug: "defi",
    description: "Self-custody, hardware wallets, passkeys, yield & collateral borrowing.",
  },
  {
    _id: "category-ecosystem",
    title: "Ecosystem",
    slug: "ecosystem",
    description: "Solana, Base, Arbitrum, Optimism, Polygon, Lightning & Cosmos IBC.",
  },
  {
    _id: "category-regulations",
    title: "Regulations",
    slug: "regulations",
    description: "Zero-FX travel, MiCA, UK FCA, Canada, taxes & remittances.",
  },
  {
    _id: "category-compare-guides",
    title: "Comparisons",
    slug: "compare-guides",
    description: "Card head-to-heads & banking rails (Rain, Baanx, Monavate).",
  },
];

/** post slug -> pillar _id. Extend as posts are published; replaces the legacy "guides" category. */
const ASSIGNMENTS: Record<string, string> = {
  "defi-collateral-spending-cards": "category-defi",
  "top-10-stablecoin-cards-2026": "category-compare-guides",
  "spend-from-ledger-trezor-self-custody-card-guide": "category-defi",
};

for (const pillar of PILLARS) {
  await sanity.createOrReplace({
    _id: pillar._id,
    _type: "category",
    title: pillar.title,
    slug: { _type: "slug", current: pillar.slug },
    description: pillar.description,
  });
  console.log(`Category ${pillar.title} → /blog/category/${pillar.slug}`);
}

for (const [slug, categoryId] of Object.entries(ASSIGNMENTS)) {
  const post = await sanity.fetch<{ _id: string; title: string } | null>(
    `*[_type == "post" && slug.current == $slug && !(_id in path("drafts.**"))][0]{_id, title}`,
    { slug },
  );
  if (!post) {
    console.warn(`! No published post "${slug}" — skipped.`);
    continue;
  }
  await sanity
    .patch(post._id)
    .set({ categories: [{ _type: "reference", _ref: categoryId, _key: Math.random().toString(36).slice(2, 10) }] })
    .commit();
  console.log(`"${post.title}" → ${categoryId}`);
}
