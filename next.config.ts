import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async redirects() {
    return [
      { source: "/card/:slug", destination: "/crypto-card/:slug", permanent: true },
      { source: "/cards", destination: "/crypto-card", permanent: true },
      { source: "/cards/:attribute", destination: "/crypto-card/:attribute", permanent: true },
      { source: "/crypto-cards", destination: "/crypto-card", permanent: true },
      { source: "/crypto-cards/:attribute", destination: "/crypto-card/:attribute", permanent: true },
      { source: "/crypto/bitcoin", destination: "/crypto/btc", permanent: true },
      { source: "/issuer", destination: "/brands", permanent: true },
      { source: "/issuer/:slug", destination: "/brands/:slug", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
