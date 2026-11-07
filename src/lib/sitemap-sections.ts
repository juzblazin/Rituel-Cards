import type { MetadataRoute } from "next";
import { cards } from "@/lib/data";
import { issuers } from "@/lib/issuers";
import { bestListPages, cardsForCountry, cryptoPages, featuredPairs, supportedCountries, useCasePages } from "@/lib/taxonomy";
import { cardPath, cryptoPath } from "@/lib/paths";
import { infraProviders } from "@/lib/infra";
import { absoluteUrl } from "@/lib/site";
import { getAuthors, getCategories, getPosts } from "@/lib/blog";

export const sitemapSectionIds = [
  "core",
  "cards",
  "best",
  "use-cases",
  "tokens",
  "chains",
  "issuers",
  "brands",
  "compare",
  "countries",
  "blog",
] as const;

export type SitemapSectionId = (typeof sitemapSectionIds)[number];

const weekly = "weekly" as const;
const cardDate = (card: (typeof cards)[number]) => new Date(card.lastVerifiedAt || card.launchedAt);

export async function buildSitemapSection(id: SitemapSectionId): Promise<MetadataRoute.Sitemap> {
  // Directory pages change whenever any card is re-verified.
  const lastModified = new Date(Math.max(...cards.map((card) => cardDate(card).getTime())));
  const withDate = (entries: MetadataRoute.Sitemap) =>
    entries.map((entry) => ({ ...entry, lastModified: entry.lastModified ?? lastModified }));

  switch (id) {
    case "core": {
      const corePages: MetadataRoute.Sitemap = [
        { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
        { url: absoluteUrl("/cards"), changeFrequency: weekly, priority: 0.9 },
        { url: absoluteUrl("/best"), changeFrequency: weekly, priority: 0.9 },
        { url: absoluteUrl("/use-cases"), changeFrequency: weekly, priority: 0.8 },
        { url: absoluteUrl("/tokens"), changeFrequency: weekly, priority: 0.9 },
        { url: absoluteUrl("/chains"), changeFrequency: weekly, priority: 0.9 },
        { url: absoluteUrl("/countries"), changeFrequency: weekly, priority: 0.9 },
        { url: absoluteUrl("/compare"), changeFrequency: weekly, priority: 0.8 },
        { url: absoluteUrl("/leaderboard"), changeFrequency: "monthly", priority: 0.9 },
        { url: absoluteUrl("/brands"), changeFrequency: weekly, priority: 0.8 },
        { url: absoluteUrl("/issuers"), changeFrequency: weekly, priority: 0.8 },
        { url: absoluteUrl("/tools"), changeFrequency: weekly, priority: 0.7 },
        { url: absoluteUrl("/tools/net-return-calculator"), changeFrequency: "monthly", priority: 0.7 },
        { url: absoluteUrl("/submit-card"), changeFrequency: "monthly", priority: 0.7 },
        { url: absoluteUrl("/methodology"), changeFrequency: "monthly", priority: 0.5 },
        { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
        { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
      ];
      return corePages.map((entry) => ({ ...entry, lastModified }));
    }
    case "cards":
      return cards.map((card) => ({
        url: absoluteUrl(cardPath(card.slug)),
        lastModified: cardDate(card),
        changeFrequency: weekly,
        priority: 0.8,
      }));
    case "best":
      return withDate(bestListPages.map((page) => ({
        url: absoluteUrl(`/best/${page.slug}`),
        changeFrequency: weekly,
        priority: 0.8,
      })));
    case "use-cases":
      return withDate(useCasePages.map((page) => ({
        url: absoluteUrl(`/use-cases/${page.slug}`),
        changeFrequency: weekly,
        priority: 0.8,
      })));
    case "tokens":
      return withDate(cryptoPages.filter((page) => page.kind === "token").map((page) => ({
        url: absoluteUrl(cryptoPath(page)),
        changeFrequency: weekly,
        priority: 0.7,
      })));
    case "chains":
      return withDate(cryptoPages.filter((page) => page.kind === "chain").map((page) => ({
        url: absoluteUrl(cryptoPath(page)),
        changeFrequency: weekly,
        priority: 0.7,
      })));
    case "issuers":
      return withDate(infraProviders.map((provider) => ({
        url: absoluteUrl(`/issuers/${provider.slug}`),
        changeFrequency: weekly,
        priority: 0.7,
      })));
    case "brands":
      return withDate(issuers
        .filter((issuer) => issuer.cards.length > 1)
        .map((issuer) => ({
          url: absoluteUrl(`/brands/${issuer.slug}`),
          changeFrequency: weekly,
          priority: 0.7,
        })));
    case "compare":
      return withDate(featuredPairs.map((pair) => ({
        url: absoluteUrl(`/compare/${pair.slug}`),
        changeFrequency: "monthly",
        priority: 0.7,
      })));
    case "countries":
      return withDate(supportedCountries
        .filter((country) => cardsForCountry(country.code).length >= 5)
        .map((country) => ({
          url: absoluteUrl(`/countries/${country.slug}`),
          changeFrequency: weekly,
          priority: 0.7,
        })));
    case "blog": {
      const [posts, categories, authors] = await Promise.all([getPosts(), getCategories(), getAuthors()]);
      const newestPost = posts[0] ? new Date(posts[0].updatedAt) : undefined;
      const entries: MetadataRoute.Sitemap = [
        { url: absoluteUrl("/blog"), lastModified: newestPost, changeFrequency: "daily", priority: 0.8 },
        ...posts.map((post) => ({
          url: absoluteUrl(`/blog/${post.slug}`),
          lastModified: new Date(post.updatedAt),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        })),
        ...categories.map((category) => ({
          url: absoluteUrl(`/blog/category/${category.slug}`),
          lastModified: newestPost,
          changeFrequency: weekly,
          priority: 0.5,
        })),
        ...authors.map((author) => ({
          url: absoluteUrl(`/blog/author/${author.slug}`),
          changeFrequency: "monthly" as const,
          priority: 0.4,
        })),
      ];
      return entries.map((entry) => ({ ...entry, lastModified: entry.lastModified ?? lastModified }));
    }
  }
}
