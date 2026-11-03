"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeNames, routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("header");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function selectLocale(next: string) {
    if (next === locale) return;
    const query = typeof window === "undefined" ? "" : window.location.search;
    const hash = typeof window === "undefined" ? "" : window.location.hash;
    startTransition(() => {
      // Pathname is locale-free here ("/compare/x"); next-intl adds the new prefix and syncs the cookie.
      router.replace(`${pathname}${query}${hash}`, { locale: next as Locale, scroll: false });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("language")}
            title={t("language")}
            className={cn("gap-1.5 px-2", isPending && "opacity-60", className)}
          />
        }
      >
        <Languages aria-hidden="true" />
        <span className="text-xs font-medium uppercase">{locale.split("-")[0]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuRadioGroup value={locale} onValueChange={(value) => selectLocale(String(value))}>
          {routing.locales.map((code) => (
            <DropdownMenuRadioItem key={code} value={code} lang={code}>
              {localeNames[code]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
