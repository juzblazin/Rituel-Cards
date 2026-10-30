import { ImageResponse } from "next/og";
import { site } from "./site";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const BRAND = "#7c3aed";
const MUTED = "#a1a1aa";
const DIVIDER = "#3f3f46";

/** Per-page share card in the same layout as the site-wide `app/opengraph-image.tsx`. */
export function renderOgImage({ eyebrow, title, stats }: { eyebrow: string; title: string; stats: string[] }) {
  const titleSize = title.length > 60 ? 54 : title.length > 36 ? 62 : 70;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          color: "#fafafa",
          fontFamily: "sans-serif",
          background: "linear-gradient(135deg, #09090b 0%, #131318 55%, #1a1a22 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", width: 44, height: 44, borderRadius: 12, background: BRAND }} />
          <div style={{ display: "flex", fontSize: 38, fontWeight: 700, letterSpacing: -1 }}>{site.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 26, color: BRAND, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2 }}>
            {eyebrow}
          </div>
          <div style={{ display: "flex", fontSize: titleSize, fontWeight: 700, lineHeight: 1.08, letterSpacing: -2, maxWidth: 1040 }}>
            {title}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 26, color: MUTED }}>
          {stats.flatMap((stat, index) => [
            ...(index > 0 ? [<span key={`d${index}`} style={{ color: DIVIDER }}>/</span>] : []),
            <span key={stat}>{stat}</span>,
          ])}
        </div>
      </div>
    ),
    ogSize,
  );
}
