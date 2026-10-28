"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, X } from "lucide-react";
import type { Card } from "@/lib/data";
import { cn } from "@/lib/cn";
import { CardArt } from "@/components/ui";
import { ComparisonMatrix } from "./comparison-matrix";

export function CompareModal({
  cards,
  onClose,
  onRemove,
}: {
  cards: Card[];
  onClose: () => void;
  onRemove?: (slug: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  // Sorted to match the canonical pair slug, so shared links are not redirects.
  const compareUrl = `/compare/${cards
    .map((card) => card.slug)
    .sort()
    .join("-vs-")}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${compareUrl}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard can be blocked; the URL is still visible in the page */
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="animate-slide-up flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-xl bg-card shadow-2xl sm:max-h-[90vh] sm:rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-6">
          <div>
            <h2 id="compare-title" className="text-sm font-medium text-foreground">
              Side-by-side comparison
            </h2>
            <p className="text-xs text-muted-foreground">
              {cards.length} cards · lowest fee and highest reward in each row marked “Best”
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy link"}
            </button>
            <Link
              href={compareUrl}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/80"
            >
              Full page <ArrowRight className="h-3 w-3" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close comparison"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {cards.length >= 2 ? (
            <ComparisonMatrix cards={cards} />
          ) : (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              Select at least two cards to compare.
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground sm:px-6">
            <span>Fees are shown as published by the issuer and normalised to USD where needed.</span>
            <div className="flex flex-wrap gap-2">
              {onRemove &&
                cards.map((card) => (
                  <button
                    key={card.slug}
                    type="button"
                    onClick={() => onRemove(card.slug)}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                  >
                    Remove {card.name} <X className="h-2.5 w-2.5" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompareTray({
  cards,
  onRemove,
  onClear,
  onOpen,
}: {
  cards: Card[];
  onRemove: (slug: string) => void;
  onClear: () => void;
  onOpen: () => void;
}) {
  if (cards.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 shadow-lg backdrop-blur-xl">
      <div className="container-page flex items-center gap-3 py-2.5">
        <div className="hidden shrink-0 sm:block">
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Comparison</div>
          <div className="text-xs text-muted-foreground">
            {cards.length}/4 selected
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
          {cards.map((card) => (
            <div
              key={card.slug}
              className="group relative flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card py-1 pl-1 pr-6"
            >
              <CardArt card={card} className="h-7 w-10 shrink-0 rounded-md" />
              <span className="max-w-[86px] truncate text-xs font-medium text-foreground sm:max-w-[130px]">
                {card.name}
              </span>
              <button
                type="button"
                onClick={() => onRemove(card.slug)}
                className="absolute right-1 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`Remove ${card.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 4 - cards.length) }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="hidden h-9 w-[120px] shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground md:flex"
            >
              Add a card
            </div>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="hidden rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground sm:block"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onOpen}
            disabled={cards.length < 2}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-medium transition",
              cards.length >= 2
                ? "bg-primary text-primary-foreground hover:bg-primary/80"
                : "cursor-not-allowed bg-muted text-muted-foreground",
            )}
          >
            Compare now
            <span className="rounded bg-card/20 px-1 text-xs">{cards.length}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
