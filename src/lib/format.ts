import type { Card } from "./data";

export function money(value: number, digits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function pct(value: number, digits = 1): string {
  return `${Number(value.toFixed(digits))}%`;
}

export function feeLabel(value: number, freeLabel = "Free"): string {
  return value === 0 ? freeLabel : money(value, value % 1 === 0 ? 0 : 2);
}

export function cashbackLabel(card: Pick<Card, "cashbackMinPct" | "cashbackMaxPct">): string {
  const { cashbackMinPct: min, cashbackMaxPct: max } = card;
  if (max === 0) return "No cashback";
  if (min === max) return `${pct(min)} cashback`;
  if (min === 0) return `Up to ${pct(max)} cashback`;
  return `${pct(min)}–${pct(max)} cashback`;
}

export function relativeAge(date: string, now = new Date()): string {
  const then = new Date(date).getTime();
  const days = Math.max(0, Math.floor((now.getTime() - then) / 86_400_000));
  if (days < 1) return "launched today";
  if (days < 14) return `${days} day${days === 1 ? "" : "s"} old`;
  if (days < 60) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} old`;
  }
  const months = Math.floor(days / 30.44);
  if (months < 24) return `${months} month${months === 1 ? "" : "s"} old`;
  return `${Math.floor(months / 12)} years old`;
}

export function isNew(launchedAt: string, now = new Date()): boolean {
  const days = (now.getTime() - new Date(launchedAt).getTime()) / 86_400_000;
  return days >= 0 && days <= 180;
}

export function ratingTone(score: number): string {
  if (score >= 8.5) return "text-success";
  if (score >= 7.5) return "text-success";
  if (score >= 6.5) return "text-warning";
  return "text-destructive";
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function domain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function csvEscape(value: string | number | boolean): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number | boolean)[][]) {
  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Drops the "Brand - Tier Card" boilerplate so titles stay short:
 * "ether.fi Cash - Cash Card" -> "ether.fi Cash", "KAST - Private Card" -> "KAST Private".
 */
export function shortCardName(name: string): string {
  const [brand, ...rest] = name.split(" - ");
  if (rest.length === 0) return name.trim();
  const tier = rest.join(" ").replace(/\s+Card$/i, "").trim();
  const brandWords = new Set(brand.toLowerCase().split(/\s+/));
  const tierIsRepeat = tier.split(/\s+/).every((word) => brandWords.has(word.toLowerCase()));
  return tier && !tierIsRepeat ? `${brand.trim()} ${tier}` : brand.trim();
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/** Joins sentences, adding the full stop a sentence is missing. */
export function sentences(...parts: string[]): string {
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => (/[.!?]$/.test(part) ? part : `${part}.`))
    .join(" ");
}
