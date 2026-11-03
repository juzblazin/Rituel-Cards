"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, Search } from "lucide-react";
import { Wordmark } from "./ui";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const nav = [
  { href: "/", key: "cryptoCard" },
  { href: "/crypto-card", key: "categories" },
  { href: "/brands", key: "brands" },
  { href: "/compare", key: "compare" },
  { href: "/leaderboard", key: "leaderboard" },
  { href: "/blog", key: "blog" },
] as const;

export function SiteHeader() {
  const t = useTranslations("header");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" aria-hidden="true" />
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Wordmark />
        </div>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={t("mainNavigation")}>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-brand/10 hover:text-foreground",
                isActive(item.href) && "bg-brand/10 text-foreground ring-1 ring-brand/15",
              )}
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("searchDirectory")}
            nativeButton={false}
            render={<Link href="/#directory" />}
          >
            <Search />
          </Button>
          <LanguageSwitcher />
          <ThemeToggle />
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/submit-card" />}
          >
            {t("submitCard")}
            <ArrowUpRight data-icon="inline-end" />
          </Button>
          <Button variant="brand" nativeButton={false} render={<Link href="/#directory" />}>
            {t("browseCards")}
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("searchDirectory")}
            nativeButton={false}
            render={<Link href="/#directory" />}
          >
            <Search />
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label={t("openMenu")} />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-sm">
              <SheetHeader className="border-b px-4 py-4">
                <SheetTitle>
                  <Wordmark />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label={t("mobileNavigation")}>
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-brand/10 hover:text-foreground",
                      isActive(item.href) && "bg-brand/10 text-foreground ring-1 ring-brand/15",
                    )}
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t p-4">
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/submit-card" onClick={() => setOpen(false)} />}
                >
                  {t("submitCard")}
                </Button>
                <Button
                  variant="brand"
                  nativeButton={false}
                  render={<Link href="/#directory" onClick={() => setOpen(false)} />}
                >
                  {t("browseCards")}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
