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
 * Identify a user with traits
 * Should be called on login/signup to associate events with a user
 */
export async function identify(
  userId: string,
  traits?: Record<string, any>
): Promise<void> {
  try {
    const sessionId = getOrCreateSessionId();
    const deviceId = getOrCreateDeviceId();

    const identifyData = {
      source: "web" as const,
      eventName: "user_identified",
      userId,
      properties: {
        ...traits,
        identifiedAt: new Date().toISOString(),
      },
      sessionId,
      deviceId,
    };

    // Send to API
    const response = await fetch("/api/growth/events/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(identifyData),
    });

    if (!response.ok) {
      throw new Error(`Failed to identify user: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error identifying user:", error);
    // Don't throw - we don't want tracking errors to break the app
  }
}

/**
 * Track retention events (return_session, returning_user)
 */
function trackRetentionEvents() {
  if (typeof window === "undefined") return;

  const LAST_VISIT_KEY = "analytics_last_visit";
  const FIRST_VISIT_KEY = "analytics_first_visit";

  const now = Date.now();
  const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
  const firstVisit = localStorage.getItem(FIRST_VISIT_KEY);

  // Set first visit if not already set
  if (!firstVisit) {
    localStorage.setItem(FIRST_VISIT_KEY, now.toString());
  }

  // Track return_session if user has visited before
  if (lastVisit) {
    const timeSinceLastVisit = now - parseInt(lastVisit);
    const daysSinceLastVisit = timeSinceLastVisit / (1000 * 60 * 60 * 24);

    // Track return_session (returning after any time away)
    track({
      eventName: "return_session",
      properties: {
        days_since_last_visit: Math.floor(daysSinceLastVisit),
        time_since_last_visit_ms: timeSinceLastVisit,
      },
    }).catch((error) => {
      console.error("Failed to track return_session:", error);
    });

    // Track returning_user (7-day retention milestone)
    if (daysSinceLastVisit >= 7 && firstVisit) {
      const daysSinceFirstVisit = (now - parseInt(firstVisit)) / (1000 * 60 * 60 * 24);
      track({
        eventName: "returning_user",
        properties: {
          days_since_first_visit: Math.floor(daysSinceFirstVisit),
          days_since_last_visit: Math.floor(daysSinceLastVisit),
        },
      }).catch((error) => {
        console.error("Failed to track returning_user:", error);
      });
    }
  }

  // Update last visit timestamp
  localStorage.setItem(LAST_VISIT_KEY, now.toString());
}

/**
 * Initialize analytics
 * Should be called on app mount
 */
export function initAnalytics() {
  if (typeof window === "undefined") return;

  // Track retention events
  trackRetentionEvents();

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
