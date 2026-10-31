"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Grid2X2, ListFilter, Rows3, Search, X } from "lucide-react";
import type { Card } from "@/lib/data";
import { audienceLabel, kycLabel, walletOptions } from "@/lib/data";
import {
  activeFilterCount,
  defaultFilters,
  type Filters,
  type SortKey,
  type ViewMode,
  filterAndSort,
  filtersToQuery,
  parseFilters,
  toggle,
} from "@/lib/filters";
import { flagFor, countryName } from "@/lib/taxonomy";
import { cn } from "@/lib/cn";
import { CardTile } from "./card-tile";
import { TableView } from "./table-view";
import { FilterSidebar } from "./filter-sidebar";
import { CompareModal, CompareTray } from "@/components/compare/compare-ui";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PAGE_SIZE = 12;

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "rating", label: "Highest rated" },
  { value: "cashback", label: "Highest cashback" },
  { value: "fx", label: "Lowest FX fee" },
  { value: "annual", label: "Lowest annual fee" },
  { value: "newest", label: "Newest" },
];

const VIEW_OPTIONS: { value: ViewMode; label: string; icon: typeof Grid2X2 }[] = [
  { value: "grid", label: "Grid", icon: Grid2X2 },
  { value: "table", label: "Table", icon: Rows3 },
];

type Props = {
  allCards: Card[];
  initialFilters?: Partial<Filters>;
  geoCountry?: string;
  initialView?: ViewMode;
  syncUrl?: boolean;
  showHeading?: boolean;
  showCountryFilter?: boolean;
  fixedCountry?: string;
  heading?: string;
  subheading?: string;
  source?: string;
  id?: string;
};

export function Directory({
  allCards,
  initialFilters,
  geoCountry = "ALL",
  initialView = "grid",
  syncUrl = false,
  showHeading = true,
  showCountryFilter = true,
  fixedCountry,
  heading = "All crypto cards",
  subheading,
  source = "directory-grid",
  id,
}: Props) {
  const merged = useMemo(
    () => ({
      ...defaultFilters,
      ...initialFilters,
      ...(fixedCountry ? { country: fixedCountry } : {}),
    }),
    [initialFilters, fixedCountry],
  );

  const [filters, setFilters] = useState<Filters>(merged);
  const [view, setView] = useState<ViewMode>(initialView);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const baseCards = useMemo(
    () => (fixedCountry ? allCards.filter((card) => card.supportedCountries.includes(fixedCountry)) : allCards),
    [allCards, fixedCountry],
  );

  const results = useMemo(() => filterAndSort(baseCards, filters), [baseCards, filters]);
  const displayCountry = filters.country !== "ALL" ? filters.country : geoCountry;

  useEffect(() => {
    if (!syncUrl) return;
    const query = filtersToQuery(filters);
    const params = new URLSearchParams(query);
    if (view === "table") params.set("view", "table");
    const url = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState(null, "", url);
    setVisible(PAGE_SIZE);
  }, [filters, view, syncUrl]);

  useEffect(() => {
    if (!syncUrl) return;
    const onPop = () => {
      const params = Object.fromEntries(new URLSearchParams(window.location.search));
      setFilters(parseFilters(params));
      setView(params.view === "table" ? "table" : "grid");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [syncUrl]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [filters.q, filters.kyc, filters.custody, filters.audience, filters.country, filters.minRating, filters.wallets, filters.form, filters.funding, filters.cryptos, filters.chains, filters.sort]);

  const update = (patch: Partial<Filters>) => setFilters((current) => ({ ...current, ...patch }));
  const reset = () => setFilters({ ...defaultFilters, country: fixedCountry ?? "ALL" });

  const toggleCompare = (slug: string) => {
    setSelected((current) => {
      if (current.includes(slug)) return current.filter((value) => value !== slug);
      if (current.length >= 4) return current;
      return [...current, slug];
    });
  };

  useEffect(() => {
    if (selected.length < 2) setCompareOpen(false);
  }, [selected.length]);

  const selectedCards = selected
    .map((slug) => allCards.find((card) => card.slug === slug))
    .filter((card): card is Card => Boolean(card));

  const visibleCards = results.slice(0, visible);
  const count = activeFilterCount(filters);
  const sortLabel = SORT_OPTIONS.find((option) => option.value === filters.sort)?.label ?? SORT_OPTIONS[0].label;
  const drawerSidebar = (onClose?: () => void) => (
    <FilterSidebar
      filters={filters}
      onChange={update}
      onReset={reset}
      resultCount={results.length}
      showCountry={showCountryFilter && !fixedCountry}
      onClose={onClose}
    />
  );

  return (
    <section id={id} className="container-page scroll-mt-20">
      <div className="grid gap-6 lg:grid-cols-[252px_minmax(0,1fr)] lg:gap-7">
        <aside className="hidden lg:block">
          <div className="sticky top-[76px] max-h-[calc(100vh-92px)] overflow-y-auto rounded-xl border bg-card p-4">
            {drawerSidebar()}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                {showHeading && (
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <h2 className="text-base font-semibold tracking-tight">{heading}</h2>
                    <span className="text-xs text-muted-foreground">
                      <span className="num font-medium text-foreground">{results.length}</span> card
                      {results.length === 1 ? "" : "s"}
                    </span>
                  </div>
                )}
                {subheading && <p className="mt-0.5 text-xs text-muted-foreground">{subheading}</p>}
              </div>

              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setDrawer(true)}
                  className="flex-1 sm:flex-none lg:hidden"
                >
                  <ListFilter />
                  Filters
                  {count > 0 && (
                    <span className="grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">
                      {count}
                    </span>
                  )}
                </Button>

                <div
                  className="grid h-9 flex-1 grid-cols-2 gap-0.5 rounded-lg border bg-muted/60 p-0.5 sm:flex-none dark:bg-input/20"
                  role="group"
                  aria-label="View mode"
                >
                  {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setView(value)}
                      aria-pressed={view === value}
                      className={cn(
                        "inline-flex items-center justify-center gap-1.5 rounded-md px-3 text-xs font-medium outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        view === value
                          ? "bg-background text-foreground shadow-sm ring-1 ring-border dark:bg-input/60"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icon className="size-3.5" /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  ref={searchRef}
                  type="search"
                  value={filters.q}
                  onChange={(event) => update({ q: event.target.value })}
                  placeholder="Search cards, issuers or tokens — try “USDC” or “self-custody”"
                  className="h-9 pl-9 pr-8"
                  aria-label="Search cards"
                />
                {filters.q && (
                  <button
                    type="button"
                    onClick={() => update({ q: "" })}
                    className="absolute right-2 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {view === "grid" && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-between px-3 text-xs sm:w-[188px]"
                        aria-label={`Sort cards: ${sortLabel}`}
                      />
                    }
                  >
                    <span className="truncate">
                      <span className="text-muted-foreground">Sort:</span> {sortLabel}
                    </span>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup
                      value={filters.sort}
                      onValueChange={(value) => update({ sort: value as SortKey })}
                    >
                      {SORT_OPTIONS.map((option) => (
                        <DropdownMenuRadioItem
                          key={option.value}
                          value={option.value}
                          closeOnClick
                          className="text-xs"
                        >
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
              {filters.country !== "ALL" ? (
                <Badge variant="outline" className="gap-1.5 py-1">
                  <span aria-hidden>{flagFor(filters.country)}</span>
                  Available in {countryName(filters.country)}
                  {!fixedCountry && (
                    <button
                      type="button"
                      onClick={() => update({ country: "ALL" })}
                      className="text-muted-foreground transition hover:text-foreground"
                      aria-label="Clear country filter"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </Badge>
              ) : geoCountry !== "ALL" ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span aria-hidden>{flagFor(geoCountry)}</span>
                  Detected: {countryName(geoCountry)}
                  <button
                    type="button"
                    onClick={() => update({ country: geoCountry })}
                    className="font-medium text-foreground underline-offset-2 hover:underline"
                  >
                    filter to my country
                  </button>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span aria-hidden>🌍</span> Showing global availability
                </span>
              )}

              <span className="ml-auto text-xs text-muted-foreground">
                {results.length > 0 ? (
                  <>
                    Showing {Math.min(visible, results.length)} of {results.length}
                  </>
                ) : (
                  "No matches"
                )}
              </span>
            </div>
          </div>

          {count > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Active</span>
              {filters.q && (
                <Chip onRemove={() => update({ q: "" })}>“{filters.q}”</Chip>
              )}
              {filters.kyc !== "all" && (
                <Chip onRemove={() => update({ kyc: "all" })}>{kycLabel[filters.kyc]}</Chip>
              )}
              {filters.custody !== "all" && (
                <Chip onRemove={() => update({ custody: "all" })}>
                  {filters.custody === "self" ? "Self-custody" : "Custodial"}
                </Chip>
              )}
              {filters.audience !== "all" && (
                <Chip onRemove={() => update({ audience: "all" })}>{audienceLabel[filters.audience]}</Chip>
              )}
              {filters.country !== "ALL" && !fixedCountry && (
                <Chip onRemove={() => update({ country: "ALL" })}>{countryName(filters.country)}</Chip>
              )}
              {filters.minRating > 0 && (
                <Chip onRemove={() => update({ minRating: 0 })}>{filters.minRating}+ rating</Chip>
              )}
              {filters.wallets.map((wallet) => (
                <Chip key={wallet} onRemove={() => update({ wallets: toggle(filters.wallets, wallet) })}>
                  {walletOptions.find((w) => w.value === wallet)?.label}
                </Chip>
              ))}
              {filters.form !== "all" && (
                <Chip onRemove={() => update({ form: "all" })}>{filters.form === "virtual" ? "Virtual" : "Physical"}</Chip>
              )}
              {filters.funding !== "all" && (
                <Chip onRemove={() => update({ funding: "all" })}>{filters.funding === "credit" ? "Credit" : "Debit / prepaid"}</Chip>
              )}
              {filters.cryptos.map((crypto) => (
                <Chip key={crypto} onRemove={() => update({ cryptos: toggle(filters.cryptos, crypto) })}>
                  {crypto}
                </Chip>
              ))}
              {filters.chains.map((chain) => (
                <Chip key={chain} onRemove={() => update({ chains: toggle(filters.chains, chain) })}>
                  {chain}
                </Chip>
              ))}
              <button type="button" onClick={reset} className="ml-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
                Clear all
              </button>
            </div>
          )}

          <div className="mt-4">
            {results.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-card px-6 py-16 text-center">
                <p className="text-sm font-medium">No cards match these filters</p>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  Try removing the network or crypto filter, or reset everything and start from the full directory.
                </p>
                <Button type="button" onClick={reset} className="mt-4">
                  Reset filters
                </Button>
              </div>
            ) : view === "grid" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {(() => {
                    const sponsoredTop = new Set(
                      visibleCards.filter((card) => card.isSponsored).slice(0, 3).map((card) => card.slug),
                    );
                    return visibleCards.map((card, index) => (
                    <Fragment key={card.id}>
                      <CardTile
                        card={card}
                        displayCountry={displayCountry}
                        selected={selected.includes(card.slug)}
                        onToggleCompare={() => toggleCompare(card.slug)}
                        compareDisabled={selected.length >= 4}
                        source={source}
                        showSponsored={sponsoredTop.has(card.slug)}
                      />
                      {index === 5 && visibleCards.length > 6 && <MidFeedBanner />}
                    </Fragment>
                    ));
                  })()}
                </div>

                {visible < results.length && (
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setVisible((value) => value + PAGE_SIZE)}
                    >
                      Show {Math.min(PAGE_SIZE, results.length - visible)} more cards
                      <ChevronDown />
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {results.length - visible} remaining · all metrics are independently normalised
                    </span>
                  </div>
                )}
              </>
            ) : (
              <TableView
                cards={results}
                selected={selected}
                onToggleCompare={toggleCompare}
                compareDisabled={selected.length >= 4}
              />
            )}
          </div>

          {selected.length > 0 && <div className="h-24" aria-hidden />}
        </div>
      </div>

      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent side="left" className="flex w-[92%] max-w-sm flex-col p-0">
          <SheetHeader className="border-b px-4 py-4">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4">{drawerSidebar(() => setDrawer(false))}</div>
        </SheetContent>
      </Sheet>

      <CompareTray
        cards={selectedCards}
        onRemove={toggleCompare}
        onClear={() => setSelected([])}
        onOpen={() => setCompareOpen(true)}
      />
      {compareOpen && (
        <CompareModal
          cards={selectedCards}
          onClose={() => setCompareOpen(false)}
          onRemove={toggleCompare}
        />
      )}
    </section>
  );
}

function Chip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs text-muted-foreground">
      {children}
      <button type="button" onClick={onRemove} className="transition hover:text-foreground" aria-label={`Remove ${children} filter`}>
        <X className="size-2.5" />
      </button>
    </span>
  );
}

function MidFeedBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-foreground p-5 text-background sm:col-span-2 xl:col-span-3">
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-background/60">
            <span className="size-1.5 rounded-full bg-success" /> Partner placement
          </div>
          <h3 className="mt-2 text-lg font-semibold tracking-tight">
            Reach 40,000 monthly card searchers.
          </h3>
          <p className="mt-1 max-w-md text-sm leading-6 text-background/70">
            Featured cards get pinned placement, a verified badge and a Fast-Track data review. One flat
            monthly fee — no CPC surprises.
          </p>
        </div>
        <ButtonLink
          href="/submit-card"
          size="sm"
          className="shrink-0 self-start bg-background text-foreground hover:bg-background/90 sm:self-auto"
        >
          See placements <ArrowUpRight />
        </ButtonLink>
      </div>
    </div>
  );
}
