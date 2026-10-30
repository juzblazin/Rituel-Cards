---
name: blog-images
description: Generate on-brand cover and in-article images for RItuel blog posts with APIMart (gpt-image-2.5-ext) and attach them in Sanity. Use whenever a blog post is written, published, or needs a new image.
---

# Blog images

1. Read `brand/image-style.md` and look at `brand/images/brand-board.png`. Every image must follow them.
2. Write a one-sentence scene that represents the post's topic using the brand motifs (glass cards, coins, sparkle shape, arrows, rings). No text, logos or people.
3. Generate and attach:
   ```sh
   npm run blog:image -- --slug <post-slug> --prompt "<scene>" --alt "<alt text>"
   ```
   - Add `--inline` for a 4:3 in-article image; it is uploaded to Sanity and its asset ID is printed, so insert it into the post body as an image block with alt text.
   - Without `--prompt`, the scene is built from the post's title and excerpt.
   - Needs `APIMART_API_KEY` and `SANITY_WRITE_TOKEN` (Sanity Editor token) in the environment. Never commit or print them.
4. View the downloaded result before reporting. Regenerate if it contains text, logos, people, a dark/neon look, or drifts from the palette.
5. Check the post on the live Cloudflare site (`https://rituel.petra-thach.workers.dev/blog/<slug>`); the page reads Sanity live, so no deploy is needed.

## API notes
- `POST https://api.apimart.ai/v1/images/generations` with `model`, `prompt`, `size` (`16:9`, `4:3`), `n`, and `image_urls` (the public brand board URL is a style reference) returns a `task_id`.
- Poll `GET /v1/tasks/<task_id>` until `status` is `completed`; the image is at `data.result.images[0].url[0]`. It takes about a minute and costs about $0.01.
- APIMart image URLs expire after about a day, so always copy the image into Sanity (the script does this).
