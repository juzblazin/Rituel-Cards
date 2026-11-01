---
name: blog-images
description: Generate on-brand cover and in-article images for RItuel blog posts with APIMart (gpt-image-2.5-ext) and attach them in Sanity. Use whenever a blog post is written, published, or needs a new image.
---

# Blog images

1. Read `brand/guidelines.md` and `brand/image-style.md`. Every image must follow them — **hybrid system: dark covers, light in-article images**.
2. Write a one-sentence scene that represents the post's topic using the brand motifs (glass cards, coins, the four-point sparkle, arrows, rings, glow orbs). No text, logos or people. If the brief specifies a background, it wins over the defaults.
3. Generate and attach (reads `.env.local` automatically):
   ```sh
   npm run blog:image -- --slug <post-slug> --prompt "<scene>" --alt "<alt text>"
   ```
   - Default: 16:9 **dark** cover on a midnight→deep-purple field, attached as `mainImage`.
   - `--light`: 16:9 cover in the light lavender style — use when the brief asks for a light/white field.
   - `--inline`: 4:3 light in-article image; uploads and prints the asset ID — insert it into the post body as `{ _type: "image", asset: { _ref: "<id>" }, alt }`.
   - `--upload-only`: uploads without attaching; prints asset ID + URL (for pre-building assets before a post exists).
   - `--preview`: saves `preview-<slug>.png` locally, no Sanity calls — use it to check a new prompt cheaply.
   - Without `--prompt`, the scene is built from the post's title and excerpt.
4. View the result before reporting. Regenerate if it contains text, logos, people, a neon/cyberpunk look, or drifts from the palette (an approved dark cover can become `brand/images/cover-board.png` + a style reference).
5. Check the post on the live Cloudflare site (`https://rituel.petra-thach.workers.dev/blog/<slug>`); the page reads Sanity live, so no deploy is needed.

## API notes
- `POST https://api.apimart.ai/v1/images/generations` with `model`, `prompt`, `size` (`16:9`, `4:3`), `n`, and `image_urls` (the public light brand-board URL — light style only; brand books are text-heavy and must not be sent) returns a `task_id`.
- Poll `GET /v1/tasks/<task_id>` until `status` is `completed`; the image is at `data.result.images[0].url[0]`. It takes about a minute and costs about $0.01.
- APIMart image URLs expire after about a day, so always copy the image into Sanity (the script does this).
- Needs `APIMART_API_KEY`, and `SANITY_WRITE_TOKEN` (Sanity Editor token) unless `--preview`. Never commit or print them.
