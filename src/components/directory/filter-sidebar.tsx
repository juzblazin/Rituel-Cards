"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Globe2, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { countries } from "@/lib/countries";
import { chainOptions, cryptoOptions, walletOptions } from "@/lib/data";
import { activeFilterCount, type Filters, toggle } from "@/lib/filters";
import { cn } from "@/lib/cn";
import { flagFor } from "@/lib/taxonomy";

type Props = {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  resultCount: number;
  showCountry?: boolean;
  onClose?: () => void;
};

const KYC_OPTIONS = [
  ["all", "All cards"],
  ["no_kyc", "No KYC"],
  ["light_kyc", "Light KYC"],
  ["full_kyc", "Full KYC"],
] as const;

const CUSTODY_OPTIONS = [
  ["all", "All"],
  ["self", "Self-custody"],
  ["custodial", "Custodial"],
] as const;

const AUDIENCE_OPTIONS = [
  ["all", "All"],
  ["personal", "Personal"],
  ["business", "Business"],
] as const;

const RATING_OPTIONS = [
  [0, "All"],
  [5, "5+"],
  [7, "7+"],
  [8, "8+"],
] as const;

const FORM_OPTIONS = [
  ["all", "All"],
  ["virtual", "Virtual"],
  ["physical", "Physical"],
] as const;

const FUNDING_OPTIONS = [
  ["all", "All"],
  ["debit", "Debit / prepaid"],
  ["credit", "Credit"],
] as const;

export function FilterSidebar({
  filters,
  onChange,
  onReset,
  resultCount,
  showCountry = true,
  onClose,
}: Props) {
  const count = activeFilterCount(filters);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3.5 lg:px-0 lg:pb-4 lg:pt-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" aria-hidden />
          <h2 className="text-sm font-medium">Filters</h2>
          {count > 0 && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
            >
              <RotateCcw className="size-3" /> Reset
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 lg:px-0 lg:py-0">
        {showCountry && (
          <Group label="Available in">
            <CountrySelect value={filters.country} onChange={(country) => onChange({ country })} />
          </Group>
        )}

        <Group label="KYC level">
          <div className="grid grid-cols-2 gap-1.5">
            {KYC_OPTIONS.map(([value, label]) => (
              <Choice key={value} active={filters.kyc === value} onClick={() => onChange({ kyc: value })}>
                {label}
              </Choice>
            ))}
          </div>
        </Group>

        <Group label="Custody">
          <div className="grid grid-cols-3 gap-1.5">
            {CUSTODY_OPTIONS.map(([value, label]) => (
              <Choice key={value} active={filters.custody === value} onClick={() => onChange({ custody: value })}>
                {label}
              </Choice>
            ))}
          </div>
        </Group>

        <Group label="Audience">
          <div className="grid grid-cols-3 gap-1.5">
            {AUDIENCE_OPTIONS.map(([value, label]) => (
              <Choice key={value} active={filters.audience === value} onClick={() => onChange({ audience: value })}>
                {label}
              </Choice>
            ))}
          </div>
        </Group>

        <Group label="Minimum rating">
          <div className="grid grid-cols-4 gap-1.5">
            {RATING_OPTIONS.map(([value, label]) => (
              <Choice
                key={value}
                active={filters.minRating === value}
                onClick={() => onChange({ minRating: value })}
              >
                {label}
              </Choice>
            ))}
          </div>
        </Group>

        <Group label="Card form">
          <div className="grid grid-cols-3 gap-1.5">
            {FORM_OPTIONS.map(([value, label]) => (
              <Choice key={value} active={filters.form === value} onClick={() => onChange({ form: value })}>
                {label}
              </Choice>
            ))}
          </div>
        </Group>

        <Group label="Funding type">
          <div className="grid grid-cols-3 gap-1.5">
            {FUNDING_OPTIONS.map(([value, label]) => (
              <Choice
                key={value}
                active={filters.funding === value}
                onClick={() => onChange({ funding: value })}
              >
                {label}
              </Choice>
            ))}
          </div>
        </Group>

        <Group label="Mobile wallets">
          <div className="space-y-2">
            {walletOptions.map((wallet) => (
              <CheckRow
                key={wallet.value}
                checked={filters.wallets.includes(wallet.value)}
                onChange={() => onChange({ wallets: toggle(filters.wallets, wallet.value) })}
              >
                {wallet.label}
              </CheckRow>
            ))}
          </div>
        </Group>

        <Group label="Supported crypto">
          <div className="flex flex-wrap gap-1.5">
            {cryptoOptions.map((crypto) => {
              const active = filters.cryptos.includes(crypto.symbol);
              return (
                <button
                  key={crypto.symbol}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ cryptos: toggle(filters.cryptos, crypto.symbol) })}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium transition",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: crypto.color }} />
                  {crypto.symbol}
                </button>
              );
            })}
          </div>
        </Group>

        <Group label="Networks & chains">
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            {chainOptions.map((chain) => (
              <CheckRow
                key={chain}
                checked={filters.chains.includes(chain)}
                onChange={() => onChange({ chains: toggle(filters.chains, chain) })}
                compact
              >
                {chain}
              </CheckRow>
            ))}
          </div>
        </Group>

        <div className="mt-4 rounded-lg bg-muted p-3">
          <p className="text-xs leading-5 text-muted-foreground">
            <strong className="font-medium text-foreground">How we rank:</strong> sponsored cards are pinned first, but
            every fee comparison and calculator uses the raw numbers. No pay-to-win scoring.
          </p>
        </div>
      </div>

      {onClose && (
        <div className="border-t p-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-full rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/80"
          >
            Show {resultCount} card{resultCount === 1 ? "" : "s"}
          </button>
        </div>
      )}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-b py-4 last:border-b-0">
      <h3 className="mb-2.5 text-xs font-medium text-muted-foreground">{label}</h3>
      {children}
    </section>
  );
}

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-md border px-2 py-1.5 text-xs font-medium transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function CheckRow({
  checked,
  onChange,
  children,
  compact = false,
}: {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "flex w-full items-center gap-2 rounded-md text-left text-muted-foreground transition hover:text-foreground",
        compact ? "py-0.5 text-xs" : "py-0.5 text-xs",
      )}
    >
      <span
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-[4px] border transition",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background",
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span className="truncate">{children}</span>
    </button>
  );
}

function CountrySelect({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const selected = value === "ALL" ? null : countries.find((country) => country.code === value);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? countries.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q) : countries;
    return list.slice(0, 60);
  }, [query]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-2.5 text-left text-xs transition outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected ? (
            <>
              <span aria-hidden>{selected.flag}</span>
              <span className="truncate">{selected.name}</span>
            </>
          ) : (
            <>
              <Globe2 className="size-3.5 text-muted-foreground" aria-hidden />
              <span>All countries</span>
            </>
          )}
        </span>
        <ChevronDown className={cn("size-3.5 shrink-0 text-muted-foreground transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-30 w-full overflow-hidden rounded-lg border bg-popover shadow-lg">
          <div className="flex items-center gap-2 border-b px-2.5 py-2">
            <Search className="size-3.5 text-muted-foreground" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search 250 countries…"
              className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              aria-label="Search countries"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto p-1" role="listbox" aria-label="Countries">
            <li>
              <button
                type="button"
                onClick={() => {
                  onChange("ALL");
                  setOpen(false);
                  setQuery("");
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition hover:bg-muted",
                  value === "ALL" && "bg-muted text-foreground",
                )}
              >
                <span aria-hidden>🌍</span> All countries
              </button>
            </li>
            {options.map((country) => (
              <li key={country.code}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(country.code);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition hover:bg-muted",
                    value === country.code && "bg-muted text-foreground",
                  )}
                >
                  <span aria-hidden>{country.flag}</span>
                  <span className="truncate">{country.name}</span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">{country.code}</span>
                </button>
              </li>
            ))}
            {options.length === 0 && (
              <li className="px-2 py-3 text-center text-xs text-muted-foreground">No countries found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function CountryBadge({ code }: { code: string }) {
  const name = code === "ALL" ? "All countries" : countries.find((c) => c.code === code)?.name;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <span aria-hidden>{flagFor(code)}</span>
      {name}
    </span>
  );
}
