# Rituel image style

Hybrid system from [`guidelines.md`](guidelines.md): **dark covers, light in-article images**. Style references: [`images/brand-board.png`](images/brand-board.png) (light) — sent to the image model for light-style generations; a dark cover board gets added once the first approved dark cover exists. Brand books ([`images/brand-book-1.png`](images/brand-book-1.png), [`images/brand-book-2.png`](images/brand-book-2.png)) define the look but are full of text — never send them as `image_urls` references.

## Look and feel

- Soft, premium, optimistic fintech. Calm rather than flashy — never cyberpunk/neon.
- Soft 3D glassmorphism: rounded frosted-glass or satin forms with gentle inner glow and soft shadows.
- Generous empty space: on covers the subject sits right of centre so a title could sit left.
- Recurring motifs: the four-point sparkle (the logo's star), floating payment cards, coins, thin outlined rings, glow orbs, upward arrows, soft blobs.

## Palette (from `guidelines.md`)

| Role | Hex |
| --- | --- |
| Midnight (dark base) | `#0A0516` |
| Deep Purple (dark surface) | `#22003D` |
| Rituel Purple (primary) | `#7C4DFF` |
| Lilac (light accent) | `#B794FF` |
| Lavender (tint) | `#C9B1FF` |
| Card white | `#F3F7FE` |
| Sunset (energy accent — small details only) | `#FF6B4D` |

## Always

- One clear subject that relates to the post (cards, hardware wallet, vault, shield, chart, arrow).
- Diffuse studio lighting, rounded shapes, glass or satin materials.
- Covers (16:9, `mainImage`): midnight→deep-purple field, glowing lavender/Rituel-Purple glass subject right of centre — **unless the brief explicitly asks for a light field**.
- In-article images (4:3, `--inline`): light lavender field, single concept, simpler composition.
- Optional: one tiny Sunset accent (a spark, a rim glow). Never dominant.

## Never

- Text, letters, numbers or fake UI copy inside the image.
- Real company or token logos (use a simple generic coin or card symbol instead).
- People or faces, photo-realism, neon/cyberpunk "crypto bro" styling, harsh contrast, clutter.

## Prompt templates

Dark cover (default 16:9):
```
Wide 16:9 editorial blog cover. <one-sentence scene about the post>.
Soft 3D glassmorphism render on a midnight-to-deep-purple gradient (#0A0516 to #22003D),
rounded frosted-glass forms glowing with Rituel Purple (#7C4DFF) and lilac (#B794FF) light,
diffuse studio glow, gentle bloom, generous dark empty space, premium fintech mood.
At most one tiny warm-orange accent (#FF6B4D). No text, no letters, no numbers, no logos, no people.
```

Light (in-article 4:3, or covers that explicitly ask for a light field):
```
Wide <4:3 in-article illustration | 16:9 editorial blog cover>. <one-sentence scene>.
Use the reference image only as a style guide; do not copy its layout, text or logos.
Soft 3D glassmorphism, frosted-glass rounded forms, lavender-to-lilac field (#C9B1FF to #F3F7FE),
Rituel Purple accents (#7C4DFF), diffuse light, gentle glow, generous empty space.
No text, no letters, no numbers, no logos, no people.
```

The full style strings live in `scripts/blog-image.mts` (`STYLE_COVER`, `STYLE_LIGHT`); keep the two in sync.
