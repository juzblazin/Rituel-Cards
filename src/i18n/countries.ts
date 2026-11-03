const displayNames = new Map<string, Intl.DisplayNames>();

/** Localized country name from an ISO 3166 alpha-2 code, e.g. ("DE", "fr") -> "Allemagne". */
export function countryName(code: string, locale: string, fallback?: string): string {
  if (locale === "en" && fallback) return fallback;
  try {
    let names = displayNames.get(locale);
    if (!names) {
      names = new Intl.DisplayNames([locale], { type: "region" });
      displayNames.set(locale, names);
    }
    return names.of(code.toUpperCase()) ?? fallback ?? code;
  } catch {
    return fallback ?? code;
  }
}
