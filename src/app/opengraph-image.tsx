import { ImageResponse } from "next/og";
import { cards } from "@/lib/data";
import { supportedCountries } from "@/lib/taxonomy";

export const alt = "RItuel — independent crypto card comparison";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND = "#7c3aed";
const MUTED = "#a1a1aa";
const DIVIDER = "#3f3f46";

export default function OpengraphImage() {
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
          <div
            style={{
              display: "flex",
              width: 44,
              height: 44,
              borderRadius: 12,
              background: BRAND,
            }}
          />
          <div style={{ display: "flex", fontSize: 38, fontWeight: 700, letterSpacing: -1 }}>
            rituel
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 70,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -2,
              maxWidth: 960,
            }}
          >
            Find the crypto card that actually pays you.
          </div>
          <div style={{ display: "flex", fontSize: 28, color: MUTED }}>
            Real fees, real cashback, real country availability.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 24, color: MUTED }}>
          <span>{cards.length} cards tracked</span>
          <span style={{ color: DIVIDER }}>/</span>
          <span>{supportedCountries.length} country directories</span>
          <span style={{ color: DIVIDER }}>/</span>
          <span>Audited October 2026</span>
        </div>
      </div>
    ),
    size,
  );
}
