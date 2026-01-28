/**
 * Meta Conversions API (CAPI) Client
 *
 * Sends server-side events to Meta for attribution and deduplication with browser pixel events.
 * Uses event_id matching to deduplicate pixel and CAPI events.
 */

import crypto from "crypto";

// Meta CAPI Event Structure
// https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event
interface MetaCAPIEvent {
  event_name: string;
  event_time: number; // Unix timestamp in seconds
  event_id?: string; // For deduplication with Pixel
  event_source_url?: string;
  action_source: "website" | "app" | "email" | "phone_call" | "chat" | "physical_store" | "system_generated" | "other";
  user_data: {
    em?: string[]; // SHA256 hashed email
    ph?: string[]; // SHA256 hashed phone
    fn?: string[]; // SHA256 hashed first name
    ln?: string[]; // SHA256 hashed last name
    ct?: string[]; // SHA256 hashed city
    st?: string[]; // SHA256 hashed state
    zp?: string[]; // SHA256 hashed zip
    country?: string[]; // SHA256 hashed country code
    external_id?: string[]; // Hashed user ID
    client_ip_address?: string;
    client_user_agent?: string;
    fbp?: string; // Facebook browser ID (_fbp cookie)
    fbc?: string; // Facebook click ID (_fbc cookie)
  };
  custom_data?: Record<string, any>;
  opt_out?: boolean;
  data_processing_options?: string[];
  data_processing_options_country?: number;
  data_processing_options_state?: number;
}

interface SendEventOptions {
  eventName: string;
  eventId?: string; // Must match pixel event_id for deduplication
  eventTime?: Date;
  eventSourceUrl?: string;
  actionSource?: MetaCAPIEvent["action_source"];

  // User data
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  externalId?: string;

  // Browser data (from cookies)
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  clientUserAgent?: string;

  // Custom event data
  customData?: Record<string, any>;
}

/**
 * SHA256 hash a value for PII protection
 */
function hashValue(value: string): string {
  return crypto.createHash("sha256").update(value.toLowerCase().trim()).digest("hex");
}

/**
 * Hash user data fields for Meta CAPI
 */
function hashUserData(data: {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  externalId?: string;
}): Partial<MetaCAPIEvent["user_data"]> {
  const hashed: Partial<MetaCAPIEvent["user_data"]> = {};

  if (data.email) hashed.em = [hashValue(data.email)];
  if (data.phone) hashed.ph = [hashValue(data.phone)];
  if (data.firstName) hashed.fn = [hashValue(data.firstName)];
  if (data.lastName) hashed.ln = [hashValue(data.lastName)];
  if (data.city) hashed.ct = [hashValue(data.city)];
  if (data.state) hashed.st = [hashValue(data.state)];
  if (data.zip) hashed.zp = [hashValue(data.zip)];
  if (data.country) hashed.country = [hashValue(data.country)];
  if (data.externalId) hashed.external_id = [hashValue(data.externalId)];

  return hashed;
}

/**
 * Send event to Meta Conversions API
 */
export async function sendMetaCAPIEvent(options: SendEventOptions): Promise<{ success: boolean; error?: string }> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn("Meta CAPI not configured: Missing NEXT_PUBLIC_META_PIXEL_ID or META_CAPI_ACCESS_TOKEN");
    return { success: false, error: "Meta CAPI not configured" };
  }

  // Build user_data
  const userData: MetaCAPIEvent["user_data"] = {
    ...hashUserData({
      email: options.email,
      phone: options.phone,
      firstName: options.firstName,
      lastName: options.lastName,
      city: options.city,
      state: options.state,
      zip: options.zip,
      country: options.country,
      externalId: options.externalId,
    }),
    client_ip_address: options.clientIp,
    client_user_agent: options.clientUserAgent,
    fbp: options.fbp,
    fbc: options.fbc,
  };

  // Build event
  const event: MetaCAPIEvent = {
    event_name: options.eventName,
    event_time: Math.floor((options.eventTime || new Date()).getTime() / 1000),
    event_id: options.eventId, // Critical for deduplication!
    event_source_url: options.eventSourceUrl,
    action_source: options.actionSource || "website",
    user_data: userData,
    custom_data: options.customData,
  };

  // Send to Meta CAPI
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [event],
          access_token: accessToken,
          test_event_code: process.env.META_CAPI_TEST_CODE, // Optional test mode
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Meta CAPI error:", result);
      return {
        success: false,
        error: result.error?.message || "Failed to send event to Meta CAPI"
      };
    }

    // Log success
    console.log(`[Meta CAPI] Event sent: ${options.eventName}`, {
      eventId: options.eventId,
      eventsReceived: result.events_received,
      fbTraceId: result.fbtrace_id,
    });

    return { success: true };
  } catch (error) {
    console.error("Meta CAPI request failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Map standard event names to Meta standard events
 * https://developers.facebook.com/docs/meta-pixel/reference
 */
export function getMetaStandardEvent(eventName: string): string {
  const eventMap: Record<string, string> = {
    // Acquisition
    "landing_view": "PageView",
    "feature_preview": "ViewContent",

    // Activation
    "signup_complete": "CompleteRegistration",
    "login_success": "PageView",
    "activation_complete": "CompleteRegistration",

    // Core Value
    "profile_created": "Lead",
    "date_request_sent": "InitiateCheckout",
    "date_request_approved": "AddToCart",

    // Monetization
    "checkout_started": "InitiateCheckout",
    "purchase_completed": "Purchase",
    "subscription_started": "Subscribe",
    "subscription_renewed": "Subscribe",

    // Retention
    "return_session": "PageView",
  };

  return eventMap[eventName] || "CustomEvent";
}
