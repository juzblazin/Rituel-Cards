import type { MetadataRoute } from "next";
import { cards } from "@/lib/data";
import { attributePages, cryptoPages, featuredPairs, supportedCountries } from "@/lib/taxonomy";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-10-27T00:00:00Z");

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/cards"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/countries"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/crypto"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/compare"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/submit-card"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/methodology"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
  ];

  const cardPages: MetadataRoute.Sitemap = cards.map((card) => ({
    url: absoluteUrl(`/card/${card.slug}`),
    lastModified: new Date(card.launchedAt),
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

  return [...staticPages, ...cardPages, ...attributeUrls, ...cryptoUrls, ...countryUrls, ...compareUrls].map((entry) => ({
    ...entry,
    lastModified: entry.lastModified ?? lastModified,
  }));
}
