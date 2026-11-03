import { absoluteUrl } from "@/lib/site";
import { defaultLocale, locales, type Locale } from "./routing";

/** "/compare" -> "/es/compare" (English stays unprefixed). Use for raw <a>, <form action>, canonicals. */
export function localizedPath(locale: string, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  if (clean === "/") return `/${locale}`;
  if (clean.startsWith("/#") || clean.startsWith("/?")) return `/${locale}${clean.slice(1)}`;
  return `/${locale}${clean}`;
}

export function localizedUrl(locale: string, path = "/"): string {
  return absoluteUrl(localizedPath(locale, path));
}

/** hreflang map for `alternates.languages`, including x-default (English). */
export function languageAlternates(path: string, available: readonly Locale[] = locales): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of available) languages[locale] = localizedUrl(locale, path);
  languages["x-default"] = localizedUrl(defaultLocale, path);
  return languages;
}
