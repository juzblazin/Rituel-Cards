import type { MetadataRoute } from "next";
import { cards } from "@/lib/data";
import { issuers } from "@/lib/issuers";
import { attributePages, bestPages, cardsForCountry, cryptoPages, featuredPairs, supportedCountries } from "@/lib/taxonomy";
import { infraProviders } from "@/lib/infra";
import { absoluteUrl } from "@/lib/site";
import { getAuthors, getCategories, getPosts } from "@/lib/blog";

// Blog posts change without a rebuild, so the sitemap is generated per request.
export const dynamic = "force-dynamic";

const sectionIds = [
  "core",
  "cards",
  "categories",
  "best",
  "issuers",
  "brands",
  "compare",
  "countries",
  "crypto",
  "blog",
] as const;

type SectionId = (typeof sectionIds)[number];

export async function generateSitemaps() {
  return sectionIds.map((id) => ({ id }));
}

const weekly = "weekly" as const;
const cardDate = (card: (typeof cards)[number]) => new Date(card.lastVerifiedAt || card.launchedAt);

export default async function sitemap({ id }: { id: SectionId }): Promise<MetadataRoute.Sitemap> {
  // Directory pages change whenever any card is re-verified.
  const lastModified = new Date(Math.max(...cards.map((card) => cardDate(card).getTime())));
  const withDate = (entries: MetadataRoute.Sitemap) =>
    entries.map((entry) => ({ ...entry, lastModified: entry.lastModified ?? lastModified }));

  switch (id) {
    case "core": {
      const corePages: MetadataRoute.Sitemap = [
        { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
        { url: absoluteUrl("/crypto-card"), changeFrequency: weekly, priority: 0.9 },
        { url: absoluteUrl("/countries"), changeFrequency: weekly, priority: 0.9 },
        { url: absoluteUrl("/crypto"), changeFrequency: weekly, priority: 0.9 },
        { url: absoluteUrl("/compare"), changeFrequency: weekly, priority: 0.8 },
        { url: absoluteUrl("/brands"), changeFrequency: weekly, priority: 0.8 },
        { url: absoluteUrl("/issuers"), changeFrequency: weekly, priority: 0.8 },
        { url: absoluteUrl("/best"), changeFrequency: weekly, priority: 0.8 },
        { url: absoluteUrl("/submit-card"), changeFrequency: "monthly", priority: 0.7 },
        { url: absoluteUrl("/methodology"), changeFrequency: "monthly", priority: 0.5 },
        { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
        { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
      ];
      return corePages.map((entry) => ({ ...entry, lastModified }));
    }

    case "cards":
      return cards.map((card) => ({
        url: absoluteUrl(`/crypto-card/${card.slug}`),
        lastModified: cardDate(card),
        changeFrequency: weekly,
        priority: 0.8,
      }));

    case "categories":
      return withDate(
        attributePages.map((page) => ({
          url: absoluteUrl(`/crypto-card/${page.slug}`),
          changeFrequency: weekly,
          priority: 0.8,
        })),
      );

    case "best":
      return withDate(
        bestPages.map((page) => ({
          url: absoluteUrl(`/best/${page.slug}-crypto-cards`),
          changeFrequency: weekly,
          priority: 0.8,
        })),
      );

    case "issuers":
      return withDate(
        infraProviders.map((provider) => ({
          url: absoluteUrl(`/issuers/${provider.slug}`),
          changeFrequency: weekly,
          priority: 0.7,
        })),
      );

    case "brands":
      return withDate(
        issuers
          .filter((issuer) => issuer.cards.length > 1)
          .map((issuer) => ({
            url: absoluteUrl(`/brands/${issuer.slug}`),
            changeFrequency: weekly,
            priority: 0.7,
          })),
      );

    case "compare":
      return withDate(
        featuredPairs.map((pair) => ({
          url: absoluteUrl(`/compare/${pair.slug}`),
          changeFrequency: "monthly",
          priority: 0.7,
        })),
      );

    case "countries":
      return withDate(
        supportedCountries
          .filter((country) => cardsForCountry(country.code).length >= 5)
          .map((country) => ({
            url: absoluteUrl(`/countries/${country.slug}`),
            changeFrequency: weekly,
            priority: 0.7,
          })),
      );

    case "crypto":
      return withDate(
        cryptoPages.map((page) => ({
          url: absoluteUrl(`/crypto/${page.slug}`),
          changeFrequency: weekly,
          priority: 0.7,
        })),
      );

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
