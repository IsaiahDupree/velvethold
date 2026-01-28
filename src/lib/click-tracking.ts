/**
 * Click tracking utilities for email attribution
 */

interface TrackingParams {
  url: string;
  personId?: string;
  emailId?: string;
  campaign?: string;
  source?: string;
}

/**
 * Generate a tracked URL that redirects through our click tracker
 *
 * Usage in emails:
 * ```
 * const trackedUrl = generateTrackedUrl({
 *   url: 'https://velvethold.com/browse',
 *   personId: person.id,
 *   emailId: emailMessageId,
 *   campaign: 'welcome_email'
 * });
 * ```
 */
export function generateTrackedUrl(params: TrackingParams): string {
  const { url, personId, emailId, campaign, source = "email" } = params;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const trackUrl = new URL(`${baseUrl}/api/track/click`);

  // Add required destination URL
  trackUrl.searchParams.set("url", url);

  // Add optional tracking parameters
  if (personId) trackUrl.searchParams.set("person_id", personId);
  if (emailId) trackUrl.searchParams.set("email_id", emailId);
  if (campaign) trackUrl.searchParams.set("campaign", campaign);
  if (source) trackUrl.searchParams.set("source", source);

  return trackUrl.toString();
}

/**
 * Extract attribution data from request cookies
 */
export function getAttributionFromCookies(cookies: {
  get: (name: string) => { value: string } | undefined;
}): {
  sessionId?: string;
  attribution?: {
    source: string;
    email_id?: string;
    campaign?: string;
    person_id?: string;
    clicked_at?: string;
  };
} {
  const sessionCookie = cookies.get("vh_session_id");
  const attributionCookie = cookies.get("vh_attribution");

  let attribution;
  if (attributionCookie) {
    try {
      attribution = JSON.parse(attributionCookie.value);
    } catch (error) {
      console.error("Error parsing attribution cookie:", error);
    }
  }

  return {
    sessionId: sessionCookie?.value,
    attribution,
  };
}

/**
 * Track a conversion event with attribution data
 * Call this when a user completes a key action (signup, purchase, etc.)
 */
export async function trackConversionWithAttribution(
  eventName: string,
  properties: Record<string, any>,
  cookies: { get: (name: string) => { value: string } | undefined }
) {
  const { sessionId, attribution } = getAttributionFromCookies(cookies);

  // Import trackEvent here to avoid circular dependencies
  const { trackEvent } = await import("@/db/queries/growth-data-plane");

  return trackEvent({
    personId: attribution?.person_id,
    eventName,
    source: "web",
    properties: {
      ...properties,
      ...(attribution && { attribution }),
    },
    sessionId,
  });
}
