import { cache } from "react";
import { createClient, type SanityClient } from "@sanity/client";
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import type { PortableTextBlock } from "@portabletext/react";

// The project ID is public (it is in every image URL), so the production project is the default.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || "uzbgef9r";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
const apiVersion = "2025-01-01";

export function isBlogConfigured(): boolean {
  return projectId.length > 0;
}

let client: SanityClient | undefined;

function getClient(): SanityClient {
  client ??= createClient({ projectId, dataset, apiVersion, useCdn: true, perspective: "published" });
  return client;
}

export type BlogImage = SanityImageSource & { alt?: string; caption?: string };

export type BlogCategory = { title: string; slug: string; description?: string };

export type BlogAuthor = { name: string; slug: string; role?: string; bio?: string; image?: BlogImage };

export type BlogPostSummary = {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  mainImage?: BlogImage;
  author?: BlogAuthor;
  categories: BlogCategory[];
  readingMinutes: number;
};

export type BlogPost = BlogPostSummary & {
  seoTitle?: string;
  body: PortableTextBlock[];
  relatedCards: string[];
};

const summaryFields = `
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  "updatedAt": _updatedAt,
  mainImage,
  "author": author->{name, "slug": slug.current, role, bio, image},
  "categories": coalesce(categories[]->{title, "slug": slug.current, description}, []),
  "readingMinutes": round(length(pt::text(body)) / 5 / 220) + 1
`;

const published = `_type == "post" && defined(slug.current) && publishedAt <= now()`;

async function query<T>(groq: string, params: Record<string, string>, fallback: T): Promise<T> {
  if (!isBlogConfigured()) return fallback;
  try {
    const result = await getClient().fetch<T | null>(groq, params);
    return result ?? fallback;
  } catch (error) {
    console.error("[blog] Sanity query failed", error);
    return fallback;
  }
}

export const getPosts = cache(
  (): Promise<BlogPostSummary[]> =>
    query(`*[${published}] | order(publishedAt desc) {${summaryFields}}`, {}, []),
);

export const getPost = cache(
  (slug: string): Promise<BlogPost | null> =>
    query(
      `*[${published} && slug.current == $slug][0] {${summaryFields}, seoTitle, body, "relatedCards": coalesce(relatedCards, [])}`,
      { slug },
      null,
    ),
);

export const getCategories = cache(
  (): Promise<BlogCategory[]> =>
    query(
      `*[_type == "category" && defined(slug.current) && count(*[${published} && references(^._id)]) > 0] | order(title asc) {title, "slug": slug.current, description}`,
      {},
      [],
    ),
);

export const getCategory = cache(
  (slug: string): Promise<BlogCategory | null> =>
    query(
      `*[_type == "category" && slug.current == $slug][0] {title, "slug": slug.current, description}`,
      { slug },
      null,
    ),
);

export const getPostsByCategory = cache(
  (slug: string): Promise<BlogPostSummary[]> =>
    query(
      `*[${published} && $slug in categories[]->slug.current] | order(publishedAt desc) {${summaryFields}}`,
      { slug },
      [],
    ),
);

export function imageUrl(source: SanityImageSource, width: number, height?: number): string {
  let builder = createImageUrlBuilder({ projectId, dataset }).image(source).width(width).auto("format").fit("crop");
  if (height) builder = builder.height(height);
  return builder.url();
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
