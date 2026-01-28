/**
 * PostHog Identity Hook
 *
 * Client-side hook to identify users in PostHog
 */

"use client";

import { useEffect } from "react";
import { identifyPostHogUser } from "@/lib/posthog";

interface UsePostHogIdentifyOptions {
  personId?: string;
  traits?: Record<string, any>;
  enabled?: boolean;
}

/**
 * Hook to identify user in PostHog on mount or when personId changes
 */
export function usePostHogIdentify(options: UsePostHogIdentifyOptions) {
  const { personId, traits, enabled = true } = options;

  useEffect(() => {
    if (!enabled || !personId) return;

    identifyPostHogUser(personId, traits);
  }, [personId, traits, enabled]);
}
