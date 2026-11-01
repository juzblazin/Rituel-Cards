import { entries } from "@/lib/leaderboard";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";

export const alt = "Crypto card leaderboard";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "Leaderboard · Oct 2026",
    title: "Crypto card leaderboard — six tracks, zero vanity metrics",
    stats: [
      "$1.37B monthly volume",
      `${entries.length} programs ranked`,
      "Volume · Adoption · Net return",
    ],
  });
}
