/**
 * PostHog Analytics Client
 *
 * Client-side PostHog integration for user analytics and tracking
 */

"use client";

import posthog from "posthog-js";

// Initialize flag to ensure we only initialize once
let isInitialized = false;

/**
 * Initialize PostHog client
 * Should be called once on app mount
 */
export function initPostHog() {
  if (typeof window === "undefined") return;
  if (isInitialized) return;

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

  if (!apiKey) {
    console.warn("PostHog API key not found. Analytics will be disabled.");
    return;
  }

  posthog.init(apiKey, {
    api_host: apiHost,
    capture_pageview: true, // Automatically capture page views
    capture_pageleave: true, // Capture when users leave the page
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") {
        console.log("PostHog initialized");
      }
    },
  });

  isInitialized = true;
}

/**
 * Identify user in PostHog
 * Should be called on login/signup with the canonical person ID
 * Returns the PostHog distinct_id for identity linking
 */
export function identifyPostHogUser(
  personId: string,
  traits?: Record<string, any>
): string | undefined {
  if (typeof window === "undefined") return undefined;
  if (!isInitialized) {
    console.warn("PostHog not initialized. Call initPostHog() first.");
    return undefined;
  }

  posthog.identify(personId, traits);

  // Return the distinct_id for identity linking
  return posthog.get_distinct_id();
}

/**
 * Reset PostHog identity
 * Should be called on logout
 */
export function resetPostHogIdentity() {
  if (typeof window === "undefined") return;
  if (!isInitialized) return;

  posthog.reset();
}

/**
 * Track custom event in PostHog
 */
export function trackPostHogEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (typeof window === "undefined") return;
  if (!isInitialized) return;

  posthog.capture(eventName, properties);
}

/**
 * Get the PostHog client instance
 * Use this for advanced PostHog features
 */
export function getPostHog() {
  return posthog;
}
