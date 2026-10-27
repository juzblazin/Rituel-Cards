"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  slug: string;
  cardName: string;
  source?: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    posthog?: { capture: (event: string, properties?: Record<string, unknown>) => void };
    dataLayer?: unknown[];
  }
}

export function AffiliateLink({ slug, cardName, source = "listing", onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      href={`/go/${slug}?source=${encodeURIComponent(source)}`}
      rel="nofollow sponsored noopener"
      onClick={(event) => {
        const payload = { slug, card: cardName, source, ts: Date.now() };
        try {
          const body = JSON.stringify(payload);
          if (navigator.sendBeacon) {
            navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
          } else {
            void fetch("/api/track", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body,
              keepalive: true,
            });
          }
        } catch {
          /* tracking must never block the click */
        }
        window.gtag?.("event", "affiliate_click", {
          card_slug: slug,
          card_name: cardName,
          placement: source,
        });
        window.posthog?.capture("affiliate_click", {
          card_slug: slug,
          card_name: cardName,
          placement: source,
        });
        onClick?.(event);
      }}
    />
  );
}
