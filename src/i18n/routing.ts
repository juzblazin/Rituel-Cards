import { defineRouting } from "next-intl/routing";

export const locales = ["en", "es", "pt-BR", "fr", "de", "vi", "zh-CN", "tr", "ja", "ko"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Native names shown in the language switcher. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  "pt-BR": "Português (Brasil)",
  fr: "Français",
  de: "Deutsch",
  vi: "Tiếng Việt",
  "zh-CN": "简体中文",
  tr: "Türkçe",
  ja: "日本語",
  ko: "한국어",
};

/** Open Graph locale tags (`og:locale`). */
export const ogLocales: Record<Locale, string> = {
  en: "en_US",
  es: "es_ES",
  "pt-BR": "pt_BR",
  fr: "fr_FR",
  de: "de_DE",
  vi: "vi_VN",
  "zh-CN": "zh_CN",
  tr: "tr_TR",
  ja: "ja_JP",
  ko: "ko_KR",
};

// English keeps the existing unprefixed URLs; every other language lives under /<locale>.
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  alternateLinks: false,
});
