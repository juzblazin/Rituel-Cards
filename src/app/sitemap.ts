import type { MetadataRoute } from "next";
import { cards } from "@/lib/data";
import { attributePages, cryptoPages, featuredPairs, supportedCountries } from "@/lib/taxonomy";
import { absoluteUrl } from "@/lib/site";
import { getAuthors, getCategories, getPosts } from "@/lib/blog";

// Blog posts change without a rebuild, so the sitemap is generated per request.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories, authors] = await Promise.all([getPosts(), getCategories(), getAuthors()]);
  const newestPost = posts[0] ? new Date(posts[0].updatedAt) : undefined;
  const cardDate = (card: (typeof cards)[number]) => new Date(card.lastVerifiedAt || card.launchedAt);
  // Directory pages change whenever any card is re-verified.
  const lastModified = new Date(Math.max(...cards.map((card) => cardDate(card).getTime())));

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/cards"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/countries"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/crypto"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/compare"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/blog"), lastModified: newestPost, changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/submit-card"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/methodology"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
  ];

  const cardPages: MetadataRoute.Sitemap = cards.map((card) => ({
    url: absoluteUrl(`/card/${card.slug}`),
    lastModified: cardDate(card),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const attributeUrls: MetadataRoute.Sitemap = attributePages.map((page) => ({
    url: absoluteUrl(`/cards/${page.slug}`),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const cryptoUrls: MetadataRoute.Sitemap = cryptoPages.map((page) => ({
    url: absoluteUrl(`/crypto/${page.slug}`),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const countryUrls: MetadataRoute.Sitemap = supportedCountries.map((country) => ({
    url: absoluteUrl(`/countries/${country.slug}`),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const compareUrls: MetadataRoute.Sitemap = featuredPairs.map((pair) => ({
    url: absoluteUrl(`/compare/${pair.slug}`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));


  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: absoluteUrl(`/blog/category/${category.slug}`),
    lastModified: newestPost,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const authorUrls: MetadataRoute.Sitemap = authors.map((author) => ({
    url: absoluteUrl(`/blog/author/${author.slug}`),
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [
    ...staticPages,
    ...cardPages,
    ...attributeUrls,
    ...cryptoUrls,
    ...countryUrls,
    ...compareUrls,
    ...postUrls,
    ...categoryUrls,
    ...authorUrls,
  ].map((entry) => ({
    ...entry,
    lastModified: entry.lastModified ?? lastModified,
  }));
}
