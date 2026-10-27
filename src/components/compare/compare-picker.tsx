"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeftRight } from "lucide-react";

type Option = { slug: string; name: string };

export function ComparePicker({ options }: { options: Option[] }) {
  const [a, setA] = useState(options[0]?.slug ?? "");
  const [b, setB] = useState(options[1]?.slug ?? "");

  const href = useMemo(() => {
    if (!a || !b) return "/compare";
    const [first, second] = [a, b].sort();
    return `/compare/${first}-vs-${second}`;
  }, [a, b]);

  const same = a === b;

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr_auto]">
        <label>
          <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Card A</span>
          <select
            value={a}
            onChange={(event) => setA(event.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {options.map((option) => (
              <option key={option.slug} value={option.slug}>{option.name}</option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => {
            setA(b);
            setB(a);
          }}
          className="mb-0.5 grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted"
          aria-label="Swap cards"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>

        <label>
          <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Card B</span>
          <select
            value={b}
            onChange={(event) => setB(event.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {options.map((option) => (
              <option key={option.slug} value={option.slug}>{option.name}</option>
            ))}
          </select>
        </label>

        <Link
          href={same ? "/compare" : href}
          aria-disabled={same}
          className={
            same
              ? "pointer-events-none inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-muted px-4 text-sm font-medium text-muted-foreground"
              : "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/80"
          }
        >
          Compare <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {same && <p className="mt-2 text-xs text-destructive">Pick two different cards to compare.</p>}
    </div>
  );
}
