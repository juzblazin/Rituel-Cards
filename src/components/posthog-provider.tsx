"use client";

import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { Suspense, useEffect } from "react";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

function PageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!posthogKey || !pathname) return;
    const query = searchParams.toString();
    posthog.capture("$pageview", {
      $current_url: window.origin + pathname + (query ? `?${query}` : ""),
    });
  }, [pathname, searchParams]);
  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!posthogKey) return;
    posthog.init(posthogKey, {
      api_host: posthogHost,
      capture_pageview: false,
      capture_pageleave: true,
    });
    window.posthog = posthog;
  }, []);

  if (!posthogKey) return <>{children}</>;
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
