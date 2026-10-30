// Generates an on-brand blog image with APIMart and uploads it to Sanity.
// Usage: npm run blog:image -- --slug <post-slug> [--prompt "<scene>"] [--inline] [--alt "<alt text>"]
// Needs APIMART_API_KEY and SANITY_WRITE_TOKEN (Editor) in the environment.
import { createClient } from "@sanity/client";
import { parseArgs } from "node:util";

const MODEL = "gpt-image-2.5-ext";
const API = "https://api.apimart.ai/v1";
const BRAND_REFERENCE = "https://cdn.sanity.io/images/uzbgef9r/production/7c68507bd9b86489ca9ed20ed606e5f49fcaf183-2048x1360.png";
const STYLE =
  "Use the reference image only as a style guide (palette, lighting, materials, mood); do not copy its layout, text or logos. " +
  "Style: soft 3D glassmorphism render, rounded frosted-glass forms, lavender-to-periwinkle gradient background (#A0A2EF to #6E65E6, lightening to #F3F7FE), " +
  "indigo accents (#4038C4), deep navy only for small details (#000B51), diffuse studio light, gentle glow, clean and premium fintech feel, generous empty space. " +
  "No text, no letters, no numbers, no logos, no real brand marks, no people.";

const { values } = parseArgs({
  options: {
    slug: { type: "string" },
    prompt: { type: "string" },
    alt: { type: "string" },
    inline: { type: "boolean", default: false },
  },
});

const apiKey = process.env.APIMART_API_KEY?.trim();
const token = process.env.SANITY_WRITE_TOKEN?.trim();
if (!values.slug || !apiKey || !token) {
  console.error("Usage: npm run blog:image -- --slug <post-slug> [--prompt ...] [--inline]\nRequires APIMART_API_KEY and SANITY_WRITE_TOKEN.");
  process.exit(1);
}

const sanity = createClient({ projectId: "uzbgef9r", dataset: "production", apiVersion: "2025-01-01", token, useCdn: false });
const post = await sanity.fetch<{ _id: string; title: string; excerpt?: string } | null>(
  `*[_type == "post" && slug.current == $slug && !(_id in path("drafts.**"))][0]{_id, title, excerpt}`,
  { slug: values.slug },
);
if (!post) throw new Error(`No published post with slug "${values.slug}".`);

const scene = values.prompt ?? `A symbolic editorial scene for an article titled "${post.title}". ${post.excerpt ?? ""} Show floating frosted-glass payment cards and abstract shapes that hint at the topic.`;
const prompt = `${values.inline ? "Wide 4:3 in-article illustration." : "Wide 16:9 editorial blog cover."} ${scene} ${STYLE}`;

async function apimart(path: string, body?: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`APIMart ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

const submitted = await apimart("/images/generations", {
  model: MODEL,
  prompt,
  size: values.inline ? "4:3" : "16:9",
  n: 1,
  image_urls: [BRAND_REFERENCE],
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

// APIMart URLs expire after about a day, so the image is copied into Sanity.
const image = Buffer.from(await (await fetch(imageUrl)).arrayBuffer());
const asset = await sanity.assets.upload("image", image, { filename: `${values.slug}${values.inline ? "-inline" : ""}.png` });
const alt = values.alt ?? `Illustration for "${post.title}"`;

if (values.inline) {
  console.log(`Uploaded ${asset._id}. Add it to the post body in Studio, or reference it as { _type: "image", asset: { _ref: "${asset._id}" }, alt }.`);
} else {
  await sanity.patch(post._id).set({ mainImage: { _type: "image", asset: { _type: "reference", _ref: asset._id }, alt } }).commit();
  console.log(`Cover set on "${post.title}": ${asset.url}`);
}
