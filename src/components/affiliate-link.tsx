"use client";

import type { MouseEvent, MouseEventHandler, ReactNode } from "react";

/**
 * Affiliate outbound link.
 *
 * Renders an anchor, except when `preventNested` is set — then it renders a
 * button, so it can sit inside another link (a card tile that is clickable as a
 * whole) without nesting a second anchor.
 *
 * Props are the subset valid on both elements, so Link's own props and its
 * anchor ref are deliberately not forwarded.
 */
type Props = {
  slug: string;
  cardName: string;
  source?: string;
  preventNested?: boolean;
  className?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    posthog?: { capture: (event: string, properties?: Record<string, unknown>) => void };
    dataLayer?: unknown[];
  }
}

export function AffiliateLink({
  slug,
  cardName,
  source = "listing",
  preventNested = false,
  className,
  children,
  onClick,
}: Props) {
  const href = `/go/${slug}?source=${encodeURIComponent(source)}`;

  const trackClick = (event: MouseEvent<HTMLElement>) => {
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
  };

  if (preventNested) {
    return (
      <button
        type="button"
        className={className}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          trackClick(event);
          onClick?.(event);
          window.location.href = href;
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <a
      href={href}
      rel="nofollow sponsored noopener"
      className={className}
      onClick={(event) => {
        trackClick(event);
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
