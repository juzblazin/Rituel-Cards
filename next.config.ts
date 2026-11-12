import type { NextConfig } from "next";
import { attributePages, bestPages, cryptoPages, useCasePages } from "./src/lib/taxonomy";

// Category slugs that used to share the card namespaces now live under
// /best and /use-cases. Explicit rules run before the wildcards below.
const bestSlugs = attributePages.map((page) => page.slug);
const useCaseSlugs = useCasePages.map((page) => page.slug);
const tokens = cryptoPages.filter((page) => page.kind === "token").map((page) => page.slug);
const chains = cryptoPages.filter((page) => page.kind === "chain").map((page) => page.slug);

const redirect = (source: string, destination: string) => ({ source, destination, permanent: true });

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "@hugeicons/react", "@hugeicons/core-free-icons"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
  async redirects() {
    return [
      // Legacy category URLs shared every card namespace — map them first.
      ...["/card", "/cards", "/crypto-card", "/crypto-cards"].flatMap((prefix) => [
        ...bestSlugs.map((slug) => redirect(`${prefix}/${slug}`, `/best/${slug}`)),
        ...useCaseSlugs.map((slug) => redirect(`${prefix}/${slug}`, `/use-cases/${slug}`)),
        ...bestSlugs.map((slug) => redirect(`${prefix}/${slug}/opengraph-image`, `/best/${slug}/opengraph-image`)),
        ...useCaseSlugs.map((slug) => redirect(`${prefix}/${slug}/opengraph-image`, `/use-cases/${slug}/opengraph-image`)),
      ]),
      // Card review namespaces consolidate on /cards.
      redirect("/card/:slug/opengraph-image", "/cards/:slug/opengraph-image"),
      redirect("/card/:slug", "/cards/:slug"),
      redirect("/crypto-card", "/cards"),
      redirect("/crypto-card/:slug/opengraph-image", "/cards/:slug/opengraph-image"),
      redirect("/crypto-card/:slug", "/cards/:slug"),
      redirect("/crypto-cards", "/cards"),
      redirect("/crypto-cards/:slug/opengraph-image", "/cards/:slug/opengraph-image"),
      redirect("/crypto-cards/:slug", "/cards/:slug"),
      // Best lists dropped the -crypto-cards suffix.
      ...bestPages.map((page) => redirect(`/best/${page.slug}-crypto-cards/opengraph-image`, `/best/${page.slug}/opengraph-image`)),
      ...bestPages.map((page) => redirect(`/best/${page.slug}-crypto-cards`, `/best/${page.slug}`)),
      // The old apple-pay best list is now a use-case page.
      redirect("/best/apple-pay-crypto-cards", "/use-cases/apple-pay"),
      // /crypto split into /tokens and /chains.
      redirect("/crypto/bitcoin/opengraph-image", "/tokens/btc/opengraph-image"),
      redirect("/crypto/bitcoin", "/tokens/btc"),
      ...tokens.map((slug) => redirect(`/crypto/${slug}/opengraph-image`, `/tokens/${slug}/opengraph-image`)),
      ...tokens.map((slug) => redirect(`/crypto/${slug}`, `/tokens/${slug}`)),
      ...chains.map((slug) => redirect(`/crypto/${slug}/opengraph-image`, `/chains/${slug}/opengraph-image`)),
      ...chains.map((slug) => redirect(`/crypto/${slug}`, `/chains/${slug}`)),
      redirect("/crypto/:slug/opengraph-image", "/tokens/:slug/opengraph-image"),
      redirect("/crypto/:slug", "/tokens/:slug"),
      redirect("/crypto", "/tokens"),
      // Misc legacy.
      redirect("/issuer/opengraph-image", "/brands/opengraph-image"),
      redirect("/issuer", "/brands"),
      redirect("/issuer/:slug/opengraph-image", "/brands/:slug/opengraph-image"),
      redirect("/issuer/:slug", "/brands/:slug"),
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
      // Static brand/asset directories — long-lived cache with SWR. These files
      // change rarely; bumping the URL is cheap if one ever does.
      {
        source: "/:dir(logos|crypto|brand)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/:path*.svg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;
