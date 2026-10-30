import { ImageResponse } from "next/og";
import { brandLogoSvg } from "./brand-logo";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/** Palette from `brand/image-style.md`. */
const GRADIENT = "linear-gradient(135deg, #A0A2EF 0%, #8F8DEB 45%, #6E65E6 100%)";
const CARD = "rgba(243, 247, 254, 0.94)";
const INDIGO = "#4038C4";
const NAVY = "#000B51";
const LAVENDER = "#CCC3FB";

const logoSrc = `data:image/svg+xml;base64,${Buffer.from(brandLogoSvg).toString("base64")}`;

/** Branded share card: white glass panel on the periwinkle gradient, as on the brand board. */
export function renderOgImage({ eyebrow, title, stats }: { eyebrow: string; title: string; stats: string[] }) {
  const titleSize = title.length > 60 ? 52 : title.length > 36 ? 60 : 68;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          padding: 40,
          fontFamily: "sans-serif",
          background: GRADIENT,
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -90,
            bottom: -120,
            width: 460,
            height: 460,
            borderRadius: 9999,
            background: "rgba(204, 195, 251, 0.45)",
            display: "flex",
          }}
        />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "52px 60px",
            borderRadius: 28,
            background: CARD,
            boxShadow: "0 24px 60px rgba(64, 56, 196, 0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={200} height={59} alt="" />
            <div style={{ display: "flex", fontSize: 22, color: INDIGO }}>Crypto Card Comparison</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", fontSize: 24, color: INDIGO }}>{`[ ${eyebrow} ]`}</div>
            <div
              style={{
                display: "flex",
                fontSize: titleSize,
                lineHeight: 1.1,
                letterSpacing: -1.5,
                color: NAVY,
                maxWidth: 980,
              }}
            >
              {title}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24 }}>
            {stats.map((stat) => (
              <div
                key={stat}
                style={{
                  display: "flex",
                  padding: "10px 18px",
                  borderRadius: 14,
                  color: INDIGO,
                  background: "rgba(204, 195, 251, 0.35)",
                  border: `1px solid ${LAVENDER}`,
                }}
              >
                {stat}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    ogSize,
  );
}
