"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/growth/analytics";

/**
 * Analytics Initialization Component
 *
 * This component initializes the analytics tracking SDK on app mount.
 * It tracks page views automatically and sets up session management.
 *
 * Should be included in the root layout.
 */
export function AnalyticsInit() {
  useEffect(() => {
    // Initialize analytics and track initial page view
    const cleanup = initAnalytics();

    // Cleanup observer on unmount
    return cleanup;
  }, []);

  return null;
}
