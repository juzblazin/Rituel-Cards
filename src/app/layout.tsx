import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleAnalytics } from "@/components/google-analytics";
import { PostHogProvider } from "@/components/posthog-provider";
import { site } from "@/lib/site";
import { ogImage } from "@/lib/seo";
import "./globals.css";

const themeInitScript = `(function(){var m=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;var d=m;try{var s=localStorage.getItem("rituel-theme");if(s==="dark")d=true;else if(s==="light")d=false;}catch(e){}var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";r.dataset.theme=d?"dark":"light";})();`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Crypto Card Comparison & Directory`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "crypto card",
    "crypto debit card",
    "bitcoin card",
    "no KYC crypto card",
    "self-custody card",
    "crypto cashback card",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  applicationName: site.name,
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: ["/favicon-32.png"],
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    title: `${site.name} — Crypto Card Comparison & Directory`,
    description: site.description,
    url: site.url,
    images: [{ url: ogImage.path, width: ogImage.width, height: ogImage.height, alt: ogImage.alt }],
  },
  twitter: {
    card: "summary_large_image",
    creator: site.twitter,
    images: [ogImage.path],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground">
        <ThemeProvider>
          <PostHogProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
            >
              Skip to content
            </a>
            <SiteHeader />
            <main id="main">{children}</main>
            <SiteFooter />
          </PostHogProvider>
          <GoogleAnalytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
