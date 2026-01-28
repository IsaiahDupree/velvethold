/**
 * PostHog Provider
 *
 * Initializes PostHog on app mount
 */

"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initPostHog, getPostHog } from "@/lib/posthog";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog();
  }, []);

  // Track page views on navigation
  useEffect(() => {
    if (pathname) {
      const posthog = getPostHog();
      if (posthog) {
        let url = window.origin + pathname;
        if (searchParams && searchParams.toString()) {
          url = url + `?${searchParams.toString()}`;
        }
        posthog.capture("$pageview", {
          $current_url: url,
        });
      }
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
