// Generates an on-brand blog image with APIMart and uploads it to Sanity.
// Usage:
//   npm run blog:image -- --slug <post-slug> [--prompt "<scene>"] [--alt "<alt>"]   → 16:9 dark cover, sets mainImage
//   npm run blog:image -- --slug <post-slug> --light [...]                        → 16:9 light cover, sets mainImage
//   npm run blog:image -- --slug <post-slug> --inline [...]                       → 4:3 light inline, uploads and prints the asset id
//   npm run blog:image -- --upload-only --prompt "<scene>" [--inline|--light] [--slug s] → uploads only, prints asset id + url
//   npm run blog:image -- --preview --prompt "<scene>" [--inline|--light] [--slug s]     → saves ./preview-<slug>.png, no Sanity calls
// Needs APIMART_API_KEY always; SANITY_WRITE_TOKEN (Editor) unless --preview. Reads .env.local.
import { writeFileSync } from "node:fs";
import { createClient } from "@sanity/client";
import { parseArgs } from "node:util";
import { loadEnv } from "./env.mts";

loadEnv();

const MODEL = "gpt-image-2.5-ext";
const API = "https://api.apimart.ai/v1";

/** Light style board (public Sanity URL) — sent only for light-style images.
 *  Dark covers go prompt-only until an approved text-free dark board exists; the
 *  brand books are full of text and must never be used as image_urls. */
const REFERENCE_LIGHT =
  "https://cdn.sanity.io/images/uzbgef9r/production/7c68507bd9b86489ca9ed20ed606e5f49fcaf183-2048x1360.png";

const STYLE_LIGHT =
  "Use the reference image only as a style guide (palette, lighting, materials, mood); do not copy its layout, text or logos. " +
  "Style: soft 3D glassmorphism render, rounded frosted-glass forms, lavender-to-lilac field (#C9B1FF to #F3F7FE), " +
  "Rituel Purple accents (#7C4DFF), diffuse studio light, gentle glow, clean and premium fintech feel, generous empty space. " +
  "No text, no letters, no numbers, no logos, no real brand marks, no people.";

const STYLE_COVER =
  "Style: dark editorial illustration on a midnight-to-deep-purple gradient (#0A0516 to #22003D), " +
  "soft 3D glassmorphism subject — rounded frosted-glass forms glowing with Rituel Purple (#7C4DFF) and lilac (#B794FF) light, " +
  "diffuse studio glow, gentle bloom, generous dark empty space for a title, premium fintech mood. " +
  "At most one tiny warm-orange accent (#FF6B4D) such as a spark or rim light. " +
  "No text, no letters, no numbers, no logos, no real brand marks, no people, no neon cyberpunk styling.";

const { values } = parseArgs({
  options: {
    slug: { type: "string" },
    prompt: { type: "string" },
    alt: { type: "string" },
    inline: { type: "boolean", default: false },
    light: { type: "boolean", default: false },
    preview: { type: "boolean", default: false },
    "upload-only": { type: "boolean", default: false },
  },
});

const apiKey = process.env.APIMART_API_KEY?.trim();
const token = process.env.SANITY_WRITE_TOKEN?.trim();
const attach = !values.inline && !values.preview && !values["upload-only"];

if (!apiKey || (!token && !values.preview) || (attach && !values.slug) || (!values.prompt && !values.slug)) {
  console.error(
    "Usage: npm run blog:image -- --slug <post-slug> [--prompt ...] [--alt ...] [--inline|--light|--upload-only|--preview]\n" +
      "Requires APIMART_API_KEY, and SANITY_WRITE_TOKEN unless --preview.",
  );
  process.exit(1);
}

const sanity = createClient({
  projectId: "uzbgef9r",
  dataset: "production",
  apiVersion: "2025-01-01",
  token: values.preview ? undefined : token,
  useCdn: false,
});

// The post is only needed to attach the cover or to derive a default scene/alt.
const needsPost = attach || !values.prompt || !values.alt;
const post = values.slug && needsPost
  ? await sanity.fetch<{ _id: string; title: string; excerpt?: string } | null>(
      `*[_type == "post" && slug.current == $slug && !(_id in path("drafts.**"))][0]{_id, title, excerpt}`,
      { slug: values.slug },
    )
  : null;
if (values.slug && needsPost && !post) throw new Error(`No published post with slug "${values.slug}".`);

const scene =
  values.prompt ??
  `A symbolic editorial scene for an article titled "${post!.title}". ${post!.excerpt ?? ""} Show floating frosted-glass payment cards and abstract shapes that hint at the topic.`;
const style = values.inline || values.light ? STYLE_LIGHT : STYLE_COVER;
const prompt = `${values.inline ? "Wide 4:3 in-article illustration." : "Wide 16:9 editorial blog cover."} ${scene} ${style}`;

async function apimart(path: string, body?: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`APIMart ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

const references = values.inline || values.light ? [REFERENCE_LIGHT] : [];
const submitted = await apimart("/images/generations", {
  model: MODEL,
  prompt,
  size: values.inline ? "4:3" : "16:9",
  n: 1,
  ...(references.length > 0 ? { image_urls: references } : {}),
});
const taskId: string = submitted.data[0].task_id;
console.log(`Generating (${taskId})…`);

let imageUrl = "";
for (let attempt = 0; attempt < 60 && !imageUrl; attempt++) {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const { data } = await apimart(`/tasks/${taskId}`);
  if (data.status === "failed") throw new Error(`Generation failed: ${JSON.stringify(data)}`);
  if (data.status === "completed") imageUrl = data.result.images[0].url[0];
}
if (!imageUrl) throw new Error("Timed out waiting for APIMart.");

const image = Buffer.from(await (await fetch(imageUrl)).arrayBuffer());
const base = `${values.slug ?? "blog-image"}${values.inline ? "-inline" : ""}`;

if (values.preview) {
  const file = `preview-${base}.png`;
  writeFileSync(file, image);
  console.log(`Saved ${file} — review it, then rerun without --preview to upload.`);
  process.exit(0);
}

// APIMart URLs expire after about a day, so the image is copied into Sanity.
const asset = await sanity.assets.upload("image", image, { filename: `${base}.png` });
const alt = values.alt ?? `Illustration for "${post?.title ?? "Rituel blog"}"`;

if (!attach) {
  console.log(`Uploaded ${asset._id} (${asset.url}). Reference it as { _type: "image", asset: { _ref: "${asset._id}" }, alt }.`);
} else {
  await sanity.patch(post!._id).set({ mainImage: { _type: "image", asset: { _type: "reference", _ref: asset._id }, alt } }).commit();
  console.log(`Cover set on "${post!.title}": ${asset.url}`);
}
