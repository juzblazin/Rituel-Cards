"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import type { PostHog } from "posthog-js";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let client: PostHog | null = null;

const capturePageview = (url: string) => {
  client?.capture("$pageview", { $current_url: url });
};

function PageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!posthogKey || !pathname) return;
    const query = searchParams.toString();
    capturePageview(window.origin + pathname + (query ? `?${query}` : ""));
  }, [pathname, searchParams]);
  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!posthogKey || client) return;
    // Load posthog-js off the critical path — it never blocks first paint.
    const boot = () =>
      import("posthog-js").then(({ default: posthog }) => {
        posthog.init(posthogKey, {
          api_host: posthogHost,
          defaults: "2026-05-30",
          capture_pageview: false,
          capture_pageleave: true,
        });
        client = posthog;
        window.posthog = posthog;
        // PageView may have fired before the client was ready.
        capturePageview(window.location.href);
      });
    if ("requestIdleCallback" in window) window.requestIdleCallback(() => void boot());
    else setTimeout(() => void boot(), 1);
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PageView />
      </Suspense>
      {children}
    </>
  );
}
