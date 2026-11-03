import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { namespaces } from "./namespaces";
import { routing, type Locale } from "./routing";

type Messages = Record<string, unknown>;

function isObject(value: unknown): value is Messages {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Untranslated keys fall back to English instead of rendering the key. */
function deepMerge(base: Messages, override: Messages): Messages {
  const result: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    result[key] = isObject(value) && isObject(base[key]) ? deepMerge(base[key] as Messages, value) : value;
  }
  return result;
}

async function loadNamespace(locale: Locale, namespace: string): Promise<Messages> {
  try {
    return (await import(`../../messages/${locale}/${namespace}.json`)).default as Messages;
  } catch {
    return {};
  }
}

export async function loadMessages(locale: Locale): Promise<Messages> {
  const entries = await Promise.all(
    namespaces.map(async (namespace) => {
      const english = await loadNamespace("en", namespace);
      const localized = locale === "en" ? {} : await loadNamespace(locale, namespace);
      return [namespace, deepMerge(english, localized)] as const;
    }),
  );
  return Object.fromEntries(entries);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return {
    locale,
    messages: await loadMessages(locale),
    timeZone: "UTC",
    onError(error) {
      if (error.code !== "MISSING_MESSAGE") console.error(error);
    },
    getMessageFallback({ namespace, key }) {
      return [namespace, key].filter(Boolean).join(".");
    },
  };
});
