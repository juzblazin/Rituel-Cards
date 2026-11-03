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

export type BlogAuthor = { name: string; slug: string; role?: string; bio?: string; image?: BlogImage; links?: string[] };

export type BlogFaq = { question: string; answer: string };

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
  /** Language of the version returned ("en" unless a translation exists). */
  language: string;
};

export type BlogPost = BlogPostSummary & {
  seoTitle?: string;
  body: PortableTextBlock[];
  relatedCards: string[];
  keyTakeaways: string[];
  faqs: BlogFaq[];
};

const summaryFields = `
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  "updatedAt": _updatedAt,
  mainImage,
  "author": author->{name, "slug": slug.current, role, bio, image, "links": coalesce(links, [])},
  "categories": coalesce(categories[]->{title, "slug": slug.current, description}, []),
  "readingMinutes": round(length(pt::text(body)) / 5 / 220) + 1,
  "language": coalesce(language, "en")
`;

const published = `_type == "post" && defined(slug.current) && publishedAt <= now()`;

/** Posts in the requested language, falling back to English for untranslated posts. */
const inLanguage = `coalesce(language, "en") in [$language, "en"]`;

function preferLanguage<T extends { slug: string; language: string }>(posts: T[], language: string): T[] {
  const bySlug = new Map<string, T>();
  for (const post of posts) {
    const current = bySlug.get(post.slug);
    if (!current || (post.language === language && current.language !== language)) bySlug.set(post.slug, post);
  }
  return posts.filter((post) => bySlug.get(post.slug) === post);
}

async function query<T>(groq: string, params: Record<string, unknown>, fallback: T): Promise<T> {
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
  async (language: string = "en"): Promise<BlogPostSummary[]> =>
    preferLanguage(
      await query<BlogPostSummary[]>(`*[${published} && ${inLanguage}] | order(publishedAt desc) {${summaryFields}}`, { language }, []),
      language,
    ),
);

export const getPost = cache(
  async (slug: string, language: string = "en"): Promise<BlogPost | null> => {
    const versions = await query<BlogPost[]>(
      `*[${published} && slug.current == $slug && ${inLanguage}] {${summaryFields}, seoTitle, body, "relatedCards": coalesce(relatedCards, []), "keyTakeaways": coalesce(keyTakeaways, []), "faqs": coalesce(faqs[]{question, answer}, [])}`,
      { slug, language },
      [],
    );
    return versions.find((post) => post.language === language) ?? versions[0] ?? null;
  },
);

/** Languages a post has been published in, for hreflang alternates. */
export const getPostLanguages = cache(
  (slug: string): Promise<string[]> =>
    query(`array::unique(*[${published} && slug.current == $slug].language)`, { slug }, []).then((languages) =>
      (languages as (string | null)[]).map((language) => language ?? "en"),
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

/**
 * Every category, ordered for the pillar tab nav: the four editorial pillars
 * first (also seeded by scripts/blog-pillars.mts), the rest alphabetically.
 * Unlike getCategories this includes empty pillars so the tabs stay stable.
 */
const pillarOrder = ["defi", "ecosystem", "regulations", "compare-guides"];

export const getNavCategories = cache(async (): Promise<BlogCategory[]> => {
  const cats = await query<BlogCategory[]>(
    `*[_type == "category" && defined(slug.current)] | order(title asc) {title, "slug": slug.current, description}`,
    {},
    [],
  );
  return cats.sort((a, b) => {
    const ia = pillarOrder.indexOf(a.slug);
    const ib = pillarOrder.indexOf(b.slug);
    if (ia === -1 && ib === -1) return a.title.localeCompare(b.title);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
});

export const getCategory = cache(
  (slug: string): Promise<BlogCategory | null> =>
    query(
      `*[_type == "category" && slug.current == $slug][0] {title, "slug": slug.current, description}`,
      { slug },
      null,
    ),
);

export const getPostsByCategory = cache(
  async (slug: string, language: string = "en"): Promise<BlogPostSummary[]> =>
    preferLanguage(
      await query<BlogPostSummary[]>(
        `*[${published} && ${inLanguage} && $slug in categories[]->slug.current] | order(publishedAt desc) {${summaryFields}}`,
        { slug, language },
        [],
      ),
      language,
    ),
);

const authorFields = `name, "slug": slug.current, role, bio, image, "links": coalesce(links, [])`;

export const getAuthors = cache(
  (): Promise<BlogAuthor[]> =>
    query(`*[_type == "author" && defined(slug.current) && count(*[${published} && references(^._id)]) > 0] | order(name asc) {${authorFields}}`, {}, []),
);

export const getAuthor = cache(
  (slug: string): Promise<BlogAuthor | null> =>
    query(`*[_type == "author" && slug.current == $slug][0] {${authorFields}}`, { slug }, null),
);

export const getPostsByAuthor = cache(
  async (slug: string, language: string = "en"): Promise<BlogPostSummary[]> =>
    preferLanguage(
      await query<BlogPostSummary[]>(
        `*[${published} && ${inLanguage} && author->slug.current == $slug] | order(publishedAt desc) {${summaryFields}}`,
        { slug, language },
        [],
      ),
      language,
    ),
);

/** Intrinsic size from a Sanity asset ref (`image-<id>-<w>x<h>-<ext>`), to reserve layout space. */
export function imageDimensions(source: BlogImage): { width: number; height: number } | null {
  const ref = (source as { asset?: { _ref?: string } }).asset?._ref;
  const match = ref?.match(/-(\d+)x(\d+)-/);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : null;
}

export function imageUrl(source: SanityImageSource, width: number, height?: number): string {
  let builder = createImageUrlBuilder({ projectId, dataset }).image(source).width(width).auto("format").fit("crop");
  if (height) builder = builder.height(height);
  return builder.url();
}

export function formatPostDate(iso: string, locale: string = "en"): string {
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-GB" : locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
