// Creates (or replaces) a published Sanity blog post from a JSON spec.
// Usage: npm run --silent node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/blog-post-create.mts -- --file blog/posts/<slug>.json
// Spec fields: title, slug, excerpt, seoTitle?, publishedAt?, authorSlug?, categorySlugs?, relatedCards?, keyTakeaways?, faqs?, body (Portable Text)
// Link annotations in body: { "_key": "k1", "_type": "link", "href": "/path" } in markDefs, spans carry marks: ["k1"].
// Needs SANITY_WRITE_TOKEN (Editor) — loaded from .env.local via scripts/env.mts.
import { readFileSync } from "node:fs";
import { createClient } from "@sanity/client";
import { parseArgs } from "node:util";
import { loadEnv } from "./env.mts";

loadEnv();

const { values } = parseArgs({ options: { file: { type: "string" } } });
const token = process.env.SANITY_WRITE_TOKEN?.trim();
if (!values.file || !token) {
  console.error("Usage: blog-post-create.mts --file <spec.json>\nRequires SANITY_WRITE_TOKEN.");
  process.exit(1);
}

const spec = JSON.parse(readFileSync(values.file, "utf8"));
if (!spec.title || !spec.slug || !spec.excerpt || !spec.body) {
  throw new Error("Spec must include title, slug, excerpt and body.");
}

const sanity = createClient({
  projectId: "uzbgef9r",
  dataset: "production",
  apiVersion: "2025-01-01",
  token,
  useCdn: false,
});

// Sanity requires _key on every object inside arrays (blocks, spans, markDefs,
// rows, faqs, references). Add them recursively so specs stay readable.
const key = () => Math.random().toString(36).slice(2, 10);
function addKeys(value: unknown, inArray = false): unknown {
  if (Array.isArray(value)) return value.map((item) => addKeys(item, true));
  if (value && typeof value === "object") {
    const out = Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, addKeys(v)]),
    ) as Record<string, unknown>;
    if (inArray && out._key === undefined) out._key = key();
    return out;
  }
  return value;
}

async function refIds(type: string, slugs: string[] = []): Promise<string[]> {
  if (slugs.length === 0) return [];
  const docs = await sanity.fetch<{ _id: string; slug: string }[]>(
    `*[_type == $type && slug.current in $slugs]{_id, "slug": slug.current}`,
    { type, slugs },
  );
  const bySlug = new Map(docs.map((doc) => [doc.slug, doc._id]));
  return slugs.map((slug) => {
    const id = bySlug.get(slug);
    if (!id) throw new Error(`No ${type} with slug "${slug}".`);
    return id;
  });
}

const [authorId] = await refIds("author", spec.authorSlug ? [spec.authorSlug] : []);
const categoryIds = await refIds("category", spec.categorySlugs ?? []);

const doc = addKeys({
  _id: `post-${spec.slug}`,
  _type: "post",
  title: spec.title,
  slug: { _type: "slug", current: spec.slug },
  excerpt: spec.excerpt,
  seoTitle: spec.seoTitle,
  publishedAt: spec.publishedAt ?? new Date().toISOString(),
  author: authorId ? { _type: "reference", _ref: authorId } : undefined,
  categories: categoryIds.map((id) => ({ _type: "reference", _ref: id })),
  relatedCards: spec.relatedCards ?? [],
  keyTakeaways: spec.keyTakeaways ?? [],
  faqs: spec.faqs ?? [],
  body: spec.body,
  ...(spec.mainImage ? { mainImage: spec.mainImage } : {}),
});

const result = await sanity.createOrReplace(doc as Parameters<typeof sanity.createOrReplace>[0]);
console.log(`Post ${result._id} → https://rituel.xyz/blog/${spec.slug}`);
