# RItuel image style

Reference board: [`images/brand-board.png`](images/brand-board.png). Use it to judge every generated image; it is also sent to the image model as a style reference.

## Look and feel
- Soft, premium, optimistic fintech. Calm rather than flashy.
- Soft 3D "glassmorphism": rounded, frosted-glass or satin forms with gentle inner glow and soft shadows.
- Light, airy compositions with generous empty space, usually on the left of covers so a title could sit there.
- Recurring motifs: floating payment cards, the four-petal sparkle/clover shape, upward arrows, thin outlined rings, soft blobs.

## Palette
| Role | Hex |
| --- | --- |
| Background gradient (light → deep) | `#A0A2EF` → `#6E65E6` |
| Lavender highlight / glass | `#CCC3FB` |
| Card white | `#F3F7FE` |
| Primary indigo | `#4038C4` |
| Mid violet | `#7372E0` |
| Deep navy (small details only) | `#000B51` |

## Always
- Periwinkle/violet/white palette, diffuse studio lighting, rounded shapes.
- One clear subject that relates to the post (cards, coins, globe, shield, chart, arrow).

## Never
- Text, letters, numbers or fake UI copy inside the image.
- Real company or token logos (draw a simple generic dollar or coin symbol instead).
- People or faces, photo-realism, dark/neon "crypto bro" styling, harsh contrast, clutter.

## Formats
| Use | Ratio | Notes |
| --- | --- | --- |
| Blog cover (`mainImage`) | 16:9 | Subject right of centre, empty space left |
| In-article image | 4:3 | Single concept, simpler background |

## Prompt template
```
Wide 16:9 editorial blog cover. <one-sentence scene about the post>.
Use the reference image only as a style guide; do not copy its layout, text or logos.
Soft 3D glassmorphism, frosted-glass rounded forms, lavender-to-periwinkle gradient (#A0A2EF to #6E65E6),
indigo accents (#4038C4), diffuse light, gentle glow, generous empty space.
No text, no letters, no numbers, no logos, no people.
```
The full style string lives in `scripts/blog-image.mts` (`STYLE`); keep the two in sync.
