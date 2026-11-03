import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleAnalytics } from "@/components/google-analytics";
import { PostHogProvider } from "@/components/posthog-provider";
import { site } from "@/lib/site";
import { ogImage } from "@/lib/seo";
import { clientNamespaces } from "@/i18n/namespaces";
import { ogLocales, routing, type Locale } from "@/i18n/routing";
import { localizedUrl } from "@/i18n/paths";

const themeInitScript = `(function(){var m=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;var d=m;try{var s=localStorage.getItem("rituel-theme");if(s==="dark")d=true;else if(s==="light")d=false;}catch(e){}var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";r.dataset.theme=d?"dark":"light";})();`;

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const defaultTitle = t("defaultTitle", { site: site.name });
  const description = t("siteDescription", { count: site.cardCount });
  return {
    metadataBase: new URL(site.url),
    title: { default: defaultTitle, template: `%s | ${site.name}` },
    description,
    keywords: t("keywords").split(",").map((keyword) => keyword.trim()),
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
      locale: ogLocales[locale as Locale] ?? "en_US",
      title: defaultTitle,
      description,
      url: localizedUrl(locale, "/"),
      images: [{ url: ogImage.path, width: ogImage.width, height: ogImage.height, alt: ogImage.alt }],
    },
    twitter: { card: "summary_large_image", creator: site.twitter, images: [ogImage.path] },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const clientMessages = Object.fromEntries(clientNamespaces.map((namespace) => [namespace, messages[namespace] ?? {}]));
  const t = await getTranslations("common");

  return (
    <html lang={locale} suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground">
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          <ThemeProvider>
            <PostHogProvider>
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
              >
                {t("skipToContent")}
              </a>
              <SiteHeader />
              <main id="main">{children}</main>
              <SiteFooter />
            </PostHogProvider>
            <GoogleAnalytics />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
