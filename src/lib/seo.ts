import type { Metadata } from "next";
import { absoluteUrl, site } from "./site";

type SeoInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function buildMetadata({ title, description, path, keywords, noIndex }: SeoInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: site.twitter,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function itemListJsonLd(name: string, cards: { name: string; slug: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: cards.length,
    itemListElement: cards.map((card, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/card/${card.slug}`),
      name: card.name,
    })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

export function financialProductJsonLd(card: {
  name: string;
  slug: string;
  description: string;
  ratingScore: number;
  reviewCount: number;
  issuerName: string;
  regionLabel: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    name: card.name,
    description: card.description,
    url: absoluteUrl(`/card/${card.slug}`),
    category: "Crypto debit and credit card",
    provider: { "@type": "Organization", name: card.issuerName },
    areaServed: card.regionLabel,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: card.ratingScore,
      bestRating: 10,
      worstRating: 1,
      ratingCount: Math.max(card.reviewCount, 1),
    },
  };
}
