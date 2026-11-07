"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NavigationMenu } from "@base-ui/react/navigation-menu";
import { ArrowRight, ArrowUpRight, ChevronDown, Menu, Search } from "lucide-react";
import { Wordmark } from "./ui";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type MegaLink = { href: string; label: string; note?: string };
type MegaSection = { title: string; links: MegaLink[] };
type MegaMenu = { label: string; href: string; sections: MegaSection[]; banner: MegaLink };

const MEGA_MENUS: MegaMenu[] = [
  {
    label: "Best Cards",
    href: "/best",
    sections: [
      {
        title: "By feature",
        links: [
          { href: "/best/self-custody", label: "Self-custody cards" },
          { href: "/best/no-kyc", label: "No-KYC & private cards" },
          { href: "/best/travel", label: "Zero-FX travel cards" },
          { href: "/best/high-cashback", label: "Highest cashback cards" },
          { href: "/best/stablecoin", label: "Stablecoin spending" },
          { href: "/best/business", label: "Business & corporate" },
        ],
      },
      {
        title: "By payment job",
        links: [
          { href: "/use-cases/virtual-ad-spend", label: "Virtual cards for ad spend", note: "Meta · Google · TikTok" },
          { href: "/use-cases/apple-pay", label: "Apple Pay cards", note: "Tap to pay" },
          { href: "/use-cases/google-pay", label: "Google Wallet cards" },
          { href: "/use-cases", label: "All use cases" },
        ],
      },
    ],
    banner: { href: "/best", label: "View all curated card guides" },
  },
  {
    label: "Brands",
    href: "/brands",
    sections: [
      {
        title: "Popular brand hubs",
        links: [
          { href: "/brands/crypto-com", label: "Crypto.com", note: "All tiers" },
          { href: "/brands/kast", label: "KAST" },
          { href: "/brands/ether-fi", label: "ether.fi Cash" },
          { href: "/brands/nexo", label: "Nexo" },
          { href: "/brands/gnosis", label: "Gnosis Pay" },
          { href: "/brands", label: "Browse all brands" },
        ],
      },
      {
        title: "Card inventory",
        links: [
          { href: "/cards", label: "Every card reviewed" },
          { href: "/upcoming", label: "Upcoming cards tracker", note: "Waitlist & pre-launch" },
        ],
      },
    ],
    banner: { href: "/#directory", label: "Explore the full card database" },
  },
  {
    label: "Ecosystem",
    href: "/countries",
    sections: [
      {
        title: "Chains & networks",
        links: [
          { href: "/chains/solana", label: "Solana cards" },
          { href: "/chains/ethereum", label: "Ethereum cards" },
          { href: "/chains/base", label: "Base cards" },
          { href: "/chains/arbitrum", label: "Arbitrum cards" },
          { href: "/chains/tron", label: "Tron cards" },
          { href: "/chains", label: "All chains" },
        ],
      },
      {
        title: "Tokens & stablecoins",
        links: [
          { href: "/tokens/usdc", label: "USDC spending" },
          { href: "/tokens/usdt", label: "USDT spending" },
          { href: "/tokens/eure", label: "EUR stablecoins (EURe)" },
          { href: "/tokens", label: "All tokens" },
        ],
      },
      {
        title: "Regions & issuers",
        links: [
          { href: "/countries", label: "Top countries", note: "USA · UK · EEA · UAE" },
          { href: "/issuers", label: "BaaS issuers & BIN sponsors" },
        ],
      },
      {
        title: "Tools & calculators",
        links: [
          { href: "/tools/net-return-calculator", label: "Fee & cashback simulator" },
          { href: "/tools", label: "All tools" },
        ],
      },
    ],
    banner: { href: "/countries", label: "Browse the geo directory" },
  },
];

const DIRECT_LINKS = [
  { href: "/compare", label: "Compare" },
  { href: "/leaderboard", label: "Leaderboard" },
];

const BLOG_LINKS: MegaLink[] = [
  { href: "/blog", label: "All research" },
  { href: "/methodology", label: "How we score cards" },
  { href: "/llms.txt", label: "llms.txt", note: "Machine-readable directory" },
];

const mobileNav = [
  { href: "/", label: "Crypto Card" },
  { href: "/best", label: "Best cards" },
  { href: "/brands", label: "Brands" },
  { href: "/cards", label: "All cards" },
  { href: "/compare", label: "Compare" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/blog", label: "Blog" },
];

const mobileResources = [
  { href: "/use-cases", label: "Use cases" },
  { href: "/tokens", label: "Tokens" },
  { href: "/chains", label: "Chains" },
  { href: "/countries", label: "Countries" },
  { href: "/issuers", label: "Issuers" },
  { href: "/tools", label: "Tools" },
  { href: "/upcoming", label: "Upcoming cards" },
];

const navLinkClass =
  "inline-flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-brand/10 hover:text-foreground data-popup-open:bg-brand/10 data-popup-open:text-foreground";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const menuActive = (menu: MegaMenu) =>
    isActive(menu.href) || menu.sections.some((section) => section.links.some((link) => isActive(link.href)));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" aria-hidden="true" />
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Wordmark />
        </div>

        <NavigationMenu.Root className="hidden lg:block">
          <NavigationMenu.List className="flex items-center gap-1" aria-label="Main navigation">
            {MEGA_MENUS.slice(0, 2).map((menu) => (
              <MegaNavItem key={menu.label} menu={menu} active={menuActive(menu)} />
            ))}
            {DIRECT_LINKS.map((item) => (
              <NavigationMenu.Item key={item.href}>
                <NavigationMenu.Link
                  render={<Link href={item.href} />}
                  className={cn(navLinkClass, isActive(item.href) && "bg-brand/10 text-foreground ring-1 ring-brand/15")}
                >
                  {item.label}
                </NavigationMenu.Link>
              </NavigationMenu.Item>
            ))}
            {MEGA_MENUS.slice(2).map((menu) => (
              <MegaNavItem key={menu.label} menu={menu} active={menuActive(menu)} />
            ))}
            <NavigationMenu.Item value="blog">
              <NavigationMenu.Trigger
                nativeButton={false}
                render={<Link href="/blog" />}
                className={cn(navLinkClass, isActive("/blog") && "bg-brand/10 text-foreground ring-1 ring-brand/15")}
              >
                Blog
                <NavigationMenu.Icon className="transition-transform data-popup-open:rotate-180">
                  <ChevronDown className="size-3.5" />
                </NavigationMenu.Icon>
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className="w-64 p-2">
                <ul className="flex flex-col gap-0.5">
                  {BLOG_LINKS.map((link) => (
                    <li key={link.href}>
                      <MenuLink link={link} />
                    </li>
                  ))}
                </ul>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>

          <NavigationMenu.Portal>
            <NavigationMenu.Positioner side="bottom" sideOffset={8} align="start" collisionPadding={12} className="z-50">
              <NavigationMenu.Popup className="origin-(--transform-origin) rounded-xl bg-popover text-popover-foreground shadow-[var(--shadow-menu)] outline-none transition-[opacity,transform] duration-150 ease-[cubic-bezier(.23,1,.32,1)] data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
                <NavigationMenu.Viewport className="overflow-hidden" />
              </NavigationMenu.Popup>
            </NavigationMenu.Positioner>
          </NavigationMenu.Portal>
        </NavigationMenu.Root>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search the directory"
            nativeButton={false}
            render={<Link href="/#directory" />}
          >
            <Search />
          </Button>
          <ThemeToggle />
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/submit-card" />}
          >
            Submit a card
            <ArrowUpRight data-icon="inline-end" />
          </Button>
          <Button variant="brand" nativeButton={false} render={<Link href="/#directory" />}>
            Browse cards
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search the directory"
            nativeButton={false}
            render={<Link href="/#directory" />}
          >
            <Search />
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu" />
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
              <nav className="flex flex-col gap-1 overflow-y-auto px-4" aria-label="Mobile navigation">
                {mobileNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-brand/10 hover:text-foreground",
                      isActive(item.href) && "bg-brand/10 text-foreground ring-1 ring-brand/15",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-3 border-t pt-3">
                  <div className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Resources
                  </div>
                  {mobileResources.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-brand/10 hover:text-foreground",
                        isActive(item.href) && "bg-brand/10 text-foreground ring-1 ring-brand/15",
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t p-4">
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/submit-card" onClick={() => setOpen(false)} />}
                >
                  Submit a card
                </Button>
                <Button
                  variant="brand"
                  nativeButton={false}
                  render={<Link href="/#directory" onClick={() => setOpen(false)} />}
                >
                  Browse cards
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function MegaNavItem({ menu, active }: { menu: MegaMenu; active: boolean }) {
  const columns = menu.sections.length;
  return (
    <NavigationMenu.Item value={menu.label.toLowerCase()}>
      <NavigationMenu.Trigger
        nativeButton={false}
        render={<Link href={menu.href} />}
        className={cn(navLinkClass, active && "bg-brand/10 text-foreground ring-1 ring-brand/15")}
      >
        {menu.label}
        <NavigationMenu.Icon className="transition-transform data-popup-open:rotate-180">
          <ChevronDown className="size-3.5" />
        </NavigationMenu.Icon>
      </NavigationMenu.Trigger>
      <NavigationMenu.Content
        className={cn("p-5", columns === 2 ? "w-[34rem]" : "w-[42rem]")}
      >
        <div className={cn("grid gap-6", columns === 2 ? "grid-cols-2" : "grid-cols-4")}>
          {menu.sections.map((section) => (
            <div key={section.title}>
              <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {section.title}
              </div>
              <ul className="flex flex-col gap-0.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <MenuLink link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-border pt-3">
          <NavigationMenu.Link
            render={<Link href={menu.banner.href} />}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand/10"
          >
            {menu.banner.label} <ArrowRight className="size-3.5" />
          </NavigationMenu.Link>
        </div>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  );
}

function MenuLink({ link }: { link: MegaLink }) {
  return (
    <NavigationMenu.Link
      render={<Link href={link.href} />}
      className="block rounded-lg px-2 py-1.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-muted hover:text-foreground"
    >
      {link.label}
      {link.note && <span className="block text-[11px] font-normal text-muted-foreground">{link.note}</span>}
    </NavigationMenu.Link>
  );
}
