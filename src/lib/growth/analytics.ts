/**
 * Client-side Analytics
 *
 * Helper functions for tracking events from the browser
 */

"use client";

import { v4 as uuidv4 } from "uuid";

// Re-export Meta Pixel tracking for convenience
export { trackMetaPixelEvent } from "@/components/analytics/meta-pixel";

// Session management
const SESSION_KEY = "analytics_session_id";
const DEVICE_KEY = "analytics_device_id";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  const stored = sessionStorage.getItem(SESSION_KEY);
  const timestamp = sessionStorage.getItem(`${SESSION_KEY}_timestamp`);

  if (stored && timestamp) {
    const age = Date.now() - parseInt(timestamp);
    if (age < SESSION_TIMEOUT) {
      // Update timestamp to extend session
      sessionStorage.setItem(`${SESSION_KEY}_timestamp`, Date.now().toString());
      return stored;
    }
  }

  // Create new session
  const sessionId = uuidv4();
  sessionStorage.setItem(SESSION_KEY, sessionId);
  sessionStorage.setItem(`${SESSION_KEY}_timestamp`, Date.now().toString());
  return sessionId;
}

function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";

  let deviceId = localStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem(DEVICE_KEY, deviceId);
  }
  return deviceId;
}

// Get UTM parameters from URL
function getUtmParams(): Record<string, string> | undefined {
  if (typeof window === "undefined") return undefined;

  const params = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};

  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  let hasUtm = false;

  for (const key of utmKeys) {
    const value = params.get(key);
    if (value) {
      hasUtm = true;
      utmParams[key.replace("utm_", "")] = value;
    }
  }

  // Store UTM params in session storage for attribution
  if (hasUtm) {
    sessionStorage.setItem("utm_params", JSON.stringify(utmParams));
  }

  return hasUtm ? utmParams : undefined;
}

// Get stored UTM params
function getStoredUtmParams(): Record<string, string> | undefined {
  if (typeof window === "undefined") return undefined;

  const stored = sessionStorage.getItem("utm_params");
  return stored ? JSON.parse(stored) : undefined;
}

interface TrackEventParams {
  eventName: string;
  properties?: Record<string, any>;
  includeUtm?: boolean;
}

/**
 * Track a web event
 */
export async function track(params: TrackEventParams): Promise<void> {
  try {
    const { eventName, properties = {}, includeUtm = true } = params;

    const sessionId = getOrCreateSessionId();
    const deviceId = getOrCreateDeviceId();

    // Get UTM params if requested
    const utmParams = includeUtm
      ? getUtmParams() || getStoredUtmParams()
      : undefined;

    const eventData = {
      source: "web" as const,
      eventName,
      properties,
      sessionId,
      deviceId,
      utmParams,
    };

    // Send to API
    const response = await fetch("/api/growth/events/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error(`Failed to track event: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error tracking event:", error);
    // Don't throw - we don't want tracking errors to break the app
  }
}

/**
 * Track a page view
 */
export async function trackPageView(properties?: Record<string, any>): Promise<void> {
  if (typeof window === "undefined") return;

  await track({
    eventName: "page_view",
    properties: {
      ...properties,
      path: window.location.pathname,
      url: window.location.href,
      referrer: document.referrer,
      title: document.title,
    },
  });
}

/**
 * Track a button or link click
 */
export async function trackClick(
  element: string,
  properties?: Record<string, any>
): Promise<void> {
  await track({
    eventName: "click",
    properties: {
      ...properties,
      element,
    },
  });
}

/**
 * Track form submission
 */
export async function trackFormSubmit(
  formName: string,
  properties?: Record<string, any>
): Promise<void> {
  await track({
    eventName: "form_submit",
    properties: {
      ...properties,
      formName,
    },
  });
}

/**
 * Track custom conversion events
 */
export async function trackConversion(
  conversionType: string,
  properties?: Record<string, any>
): Promise<void> {
  await track({
    eventName: "conversion",
    properties: {
      ...properties,
      conversionType,
    },
  });
}

/**
 * Initialize analytics
 * Should be called on app mount
 */
export function initAnalytics() {
  if (typeof window === "undefined") return;

  // Track initial page view
  trackPageView();

  // Track page views on navigation (for SPAs)
  let lastPath = window.location.pathname;
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      trackPageView();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
}
