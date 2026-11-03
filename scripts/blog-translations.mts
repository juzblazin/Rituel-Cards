// Translates Sanity blog posts via JSON files of strings.
//   extract  — writes blog/translations/en/<slug>.json with every translatable string of each English post.
//   check    — verifies blog/translations/<lang>/<slug>.json has the same keys and tags as English.
//   apply    — creates/replaces the translated post documents (needs SANITY_WRITE_TOKEN, Editor).
// Usage: node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/blog-translations.mts <extract|check|apply> [--lang es,fr] [--slug x]
//
// Block text is encoded as "plain <3>marked span</3> plain": a <n>…</n> tag wraps the text of the
// original span n, which carries its marks (bold, links). Translators may move tags but must keep each one.
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { createClient } from "@sanity/client";
import { loadEnv } from "./env.mts";

loadEnv();

const LANGUAGES = ["es", "pt-BR", "fr", "de", "vi", "zh-CN", "tr", "ja", "ko"];
const DIR = "blog/translations";
const SITE = /^https:\/\/(www\.)?rituel\.xyz(?=\/)/;

type Span = { _key: string; _type: "span"; text: string; marks?: string[] };
type Block = { _key: string; _type: string; children?: Span[]; [k: string]: unknown };
type Row = { _key: string; cells: string[] };
type Post = {
  _id: string;
  slug: { current: string };
  title: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  mainImage?: { alt?: string; caption?: string };
  keyTakeaways?: string[];
  faqs?: { _key?: string; question: string; answer: string }[];
  body: Block[];
  [k: string]: unknown;
};
type Strings = Record<string, string>;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { lang: { type: "string" }, slug: { type: "string" } },
});
const command = positionals[0];
const languages = values.lang ? values.lang.split(",") : LANGUAGES;
const token = process.env.SANITY_WRITE_TOKEN?.trim();
const sanity = createClient({
  projectId: "uzbgef9r",
  dataset: "production",
  apiVersion: "2025-01-01",
  useCdn: false,
  perspective: "published",
  ...(token ? { token } : {}),
});

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const unescape = (text: string) => text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

function encodeBlock(block: Block): string {
  return (block.children ?? [])
    .map((span, i) => (span.marks?.length ? `<${i}>${escape(span.text)}</${i}>` : escape(span.text)))
    .join("");
}

function decodeBlock(block: Block, encoded: string): Span[] {
  const spans: Span[] = [];
  const pattern = /<(\d+)>([\s\S]*?)<\/\1>/g;
  let last = 0;
  let n = 0;
  const push = (text: string, marks: string[]) => {
    if (text) spans.push({ _key: `${block._key}s${n++}`, _type: "span", text: unescape(text), marks });
  };
  for (const match of encoded.matchAll(pattern)) {
    push(encoded.slice(last, match.index), []);
    push(match[2], block.children?.[Number(match[1])]?.marks ?? []);
    last = match.index + match[0].length;
  }
  push(encoded.slice(last), []);
  return spans.length ? spans : [{ _key: `${block._key}s0`, _type: "span", text: "", marks: [] }];
}

const tagsOf = (text: string) => [...text.matchAll(/<\/?(\d+)>/g)].map((m) => m[0]).sort().join(" ");

function extract(post: Post): Strings {
  const out: Strings = { title: post.title };
  if (post.excerpt) out.excerpt = post.excerpt;
  if (post.seoTitle) out.seoTitle = post.seoTitle;
  if (post.seoDescription) out.seoDescription = post.seoDescription;
  if (post.mainImage?.alt) out["mainImage.alt"] = post.mainImage.alt;
  if (post.mainImage?.caption) out["mainImage.caption"] = post.mainImage.caption;
  post.keyTakeaways?.forEach((text, i) => (out[`keyTakeaways.${i}`] = text));
  post.faqs?.forEach((faq, i) => {
    out[`faqs.${i}.question`] = faq.question;
    out[`faqs.${i}.answer`] = faq.answer;
  });
  for (const block of post.body) {
    if (block._type === "block") out[`body.${block._key}`] = encodeBlock(block);
    for (const field of ["alt", "caption"] as const) {
      if (typeof block[field] === "string" && block[field]) out[`body.${block._key}.${field}`] = block[field] as string;
    }
    if (block._type === "table") {
      (block.rows as Row[]).forEach((row) => row.cells.forEach((cell, i) => (out[`body.${block._key}.${row._key}.${i}`] = cell)));
    }
  }
  return out;
}

function translate(post: Post, language: string, t: Strings): Record<string, unknown> {
  const pick = (key: string, fallback: string) => t[key] ?? fallback;
  const body = post.body.map((block) => {
    const next: Block = structuredClone(block);
    if (block._type === "block") {
      next.children = decodeBlock(block, pick(`body.${block._key}`, encodeBlock(block)));
      const markDefs = next.markDefs as { _type: string; href?: string }[] | undefined;
      // Absolute links back to the site become relative so they keep the reader's language.
      markDefs?.forEach((def) => def.href && (def.href = def.href.replace(SITE, "")));
    }
    for (const field of ["alt", "caption"] as const) {
      if (typeof block[field] === "string" && block[field]) next[field] = pick(`body.${block._key}.${field}`, block[field] as string);
    }
    if (block._type === "table") {
      next.rows = (block.rows as Row[]).map((row) => ({
        ...row,
        cells: row.cells.map((cell, i) => pick(`body.${block._key}.${row._key}.${i}`, cell)),
      }));
    }
    return next;
  });
  const { _id, _rev, _createdAt, _updatedAt, ...rest } = post;
  void _rev; void _createdAt; void _updatedAt;
  return {
    ...rest,
    _id: `${_id}-i18n-${language.toLowerCase()}`,
    _type: "post",
    language,
    translationOf: { _type: "reference", _ref: _id, _weak: true },
    title: pick("title", post.title),
    ...(post.excerpt ? { excerpt: pick("excerpt", post.excerpt) } : {}),
    ...(post.seoTitle ? { seoTitle: pick("seoTitle", post.seoTitle) } : {}),
    ...(post.seoDescription ? { seoDescription: pick("seoDescription", post.seoDescription) } : {}),
    ...(post.mainImage
      ? {
          mainImage: {
            ...post.mainImage,
            ...(post.mainImage.alt ? { alt: pick("mainImage.alt", post.mainImage.alt) } : {}),
            ...(post.mainImage.caption ? { caption: pick("mainImage.caption", post.mainImage.caption) } : {}),
          },
        }
      : {}),
    ...(post.keyTakeaways ? { keyTakeaways: post.keyTakeaways.map((text, i) => pick(`keyTakeaways.${i}`, text)) } : {}),
    ...(post.faqs
      ? {
          faqs: post.faqs.map((faq, i) => ({
            ...faq,
            question: pick(`faqs.${i}.question`, faq.question),
            answer: pick(`faqs.${i}.answer`, faq.answer),
          })),
        }
      : {}),
    body,
  };
}

function check(slug: string, language: string): string[] {
  const english: Strings = JSON.parse(readFileSync(join(DIR, "en", `${slug}.json`), "utf8"));
  const file = join(DIR, language, `${slug}.json`);
  if (!existsSync(file)) return [`${file}: missing`];
  const translated: Strings = JSON.parse(readFileSync(file, "utf8"));
  const errors: string[] = [];
  for (const key of Object.keys(english)) {
    if (typeof translated[key] !== "string" || !translated[key].trim()) errors.push(`${file}: missing "${key}"`);
    else if (tagsOf(translated[key]) !== tagsOf(english[key])) errors.push(`${file}: tags differ in "${key}"`);
  }
  for (const key of Object.keys(translated)) if (!(key in english)) errors.push(`${file}: unknown key "${key}"`);
  return errors;
}

const englishPosts = async () =>
  (await sanity.fetch<Post[]>(`*[_type == "post" && coalesce(language, "en") == "en" && defined(slug.current)]`)).filter(
    (post) => !values.slug || post.slug.current === values.slug,
  );

if (command === "extract") {
  mkdirSync(join(DIR, "en"), { recursive: true });
  for (const post of await englishPosts()) {
    writeFileSync(join(DIR, "en", `${post.slug.current}.json`), `${JSON.stringify(extract(post), null, 2)}\n`);
    console.log(`extracted ${post.slug.current}`);
  }
} else if (command === "check") {
  const slugs = readdirSync(join(DIR, "en")).map((file) => file.replace(/\.json$/, "")).filter((s) => !values.slug || s === values.slug);
  const errors = slugs.flatMap((slug) => languages.flatMap((language) => check(slug, language)));
  errors.forEach((error) => console.error(error));
  console.log(errors.length ? `${errors.length} problem(s)` : `ok: ${slugs.length} post(s) × ${languages.length} language(s)`);
  process.exit(errors.length ? 1 : 0);
} else if (command === "apply") {
  if (!token) throw new Error("apply needs SANITY_WRITE_TOKEN (Editor).");
  const tx = sanity.transaction();
  for (const post of await englishPosts()) {
    for (const language of languages) {
      const problems = check(post.slug.current, language);
      if (problems.length) throw new Error(problems.join("\n"));
      const t: Strings = JSON.parse(readFileSync(join(DIR, language, `${post.slug.current}.json`), "utf8"));
      tx.createOrReplace(translate(post, language, t) as { _id: string; _type: string });
      console.log(`queued ${language}/${post.slug.current}`);
    }
  }
  await tx.commit();
  console.log("committed");
} else {
  console.error("Usage: blog-translations.mts <extract|check|apply> [--lang es,fr] [--slug x]");
  process.exit(1);
}
