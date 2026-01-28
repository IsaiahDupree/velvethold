/**
 * Event Service
 *
 * Unified event ingestion system for the Growth Data Plane
 * Handles events from web, app, email, Stripe, booking, and Meta sources
 */

import { trackEvent, getEventsByPerson, getEventsByDateRange } from "@/db/queries/growth-data-plane";
import { resolvePersonFromExternalId, getOrCreatePerson } from "./identity-service";
import { sendMetaCAPIEvent, getMetaStandardEvent } from "../meta/capi";

export type EventSource = "web" | "app" | "email" | "stripe" | "booking" | "meta";

export interface BaseEventData {
  eventName: string;
  source: EventSource;
  properties?: Record<string, any>;
  timestamp?: Date;
  sessionId?: string;
  deviceId?: string;
  userAgent?: string;
  ipAddress?: string;
  eventId?: string; // For Meta Pixel/CAPI deduplication
}

export interface WebEventData extends BaseEventData {
  source: "web";
  personId?: string;
  anonymousId?: string;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

export interface AppEventData extends BaseEventData {
  source: "app";
  userId: string; // App user ID
}

export interface EmailEventData extends BaseEventData {
  source: "email";
  email: string;
  messageId?: string;
}

export interface StripeEventData extends BaseEventData {
  source: "stripe";
  stripeCustomerId: string;
  stripeEventId?: string;
}

export interface BookingEventData extends BaseEventData {
  source: "booking";
  userId: string; // App user ID
  requestId?: string;
}

export interface MetaEventData extends BaseEventData {
  source: "meta";
  fbp?: string; // Facebook browser ID
  fbc?: string; // Facebook click ID
  externalId?: string; // Hashed email or other identifier
  email?: string; // For CAPI user matching
  eventSourceUrl?: string; // For CAPI event context
}

export type EventData =
  | WebEventData
  | AppEventData
  | EmailEventData
  | StripeEventData
  | BookingEventData
  | MetaEventData;

/**
 * Track a unified event
 * Resolves person ID from the event data and stores in events table
 */
export async function ingestEvent(data: EventData): Promise<void> {
  let personId: string | undefined;

  // Resolve person ID based on event source
  switch (data.source) {
    case "app":
    case "booking": {
      // Resolve from app user ID
      const resolved = await resolvePersonFromExternalId("app", data.userId);
      personId = resolved || undefined;
      break;
    }

    case "email": {
      // Try to find person by email or create anonymous profile
      if (data.email) {
        const person = await getOrCreatePerson({ email: data.email });
        personId = person.id;
      }
      break;
    }

    case "stripe": {
      // Resolve from Stripe customer ID
      const resolved = await resolvePersonFromExternalId("stripe", data.stripeCustomerId);
      personId = resolved || undefined;
      break;
    }

    case "meta": {
      // Try to resolve from external ID (hashed email)
      if (data.externalId) {
        const resolved = await resolvePersonFromExternalId("meta", data.externalId);
        personId = resolved || undefined;
      }
      break;
    }

    case "web": {
      // Use provided person ID or try to resolve from anonymous ID
      personId = data.personId;
      break;
    }
  }

  // Merge UTM params into properties for web events
  const properties = { ...data.properties };
  if (data.source === "web" && data.utmParams) {
    properties.utm = data.utmParams;
  }

  // Track the event
  await trackEvent({
    personId,
    eventName: data.eventName,
    source: data.source,
    properties,
    sessionId: data.sessionId,
    deviceId: data.deviceId,
    userAgent: data.userAgent,
    ipAddress: data.ipAddress,
    eventId: data.eventId,
  });

  // Forward Meta events to CAPI for server-side tracking
  if (data.source === "meta" && data.eventId) {
    // Send to Meta Conversions API with matching event_id for deduplication
    await sendMetaCAPIEvent({
      eventName: getMetaStandardEvent(data.eventName),
      eventId: data.eventId, // Critical: Must match pixel event_id
      eventTime: data.timestamp,
      eventSourceUrl: data.eventSourceUrl,
      email: data.email,
      externalId: data.externalId,
      fbp: data.fbp,
      fbc: data.fbc,
      clientIp: data.ipAddress,
      clientUserAgent: data.userAgent,
      customData: properties,
    }).catch((error) => {
      // Log but don't fail the event ingestion
      console.error("Failed to send Meta CAPI event:", error);
    });
  }
}

/**
 * Track a web analytics event
 * Convenience method for web tracking
 */
export async function trackWebEvent(params: {
  eventName: string;
  personId?: string;
  anonymousId?: string;
  properties?: Record<string, any>;
  sessionId?: string;
  deviceId?: string;
  userAgent?: string;
  ipAddress?: string;
  utmParams?: Record<string, string>;
}) {
  await ingestEvent({
    source: "web",
    ...params,
  });
}

/**
 * Track an app event
 * Convenience method for app tracking
 */
export async function trackAppEvent(params: {
  eventName: string;
  userId: string;
  properties?: Record<string, any>;
  sessionId?: string;
  deviceId?: string;
}) {
  await ingestEvent({
    source: "app",
    ...params,
  });
}

/**
 * Track a Stripe event
 * Convenience method for payment events
 */
export async function trackStripeEvent(params: {
  eventName: string;
  stripeCustomerId: string;
  properties?: Record<string, any>;
  stripeEventId?: string;
}) {
  await ingestEvent({
    source: "stripe",
    ...params,
  });
}

/**
 * Track a booking event
 * Convenience method for date request events
 */
export async function trackBookingEvent(params: {
  eventName: string;
  userId: string;
  properties?: Record<string, any>;
  requestId?: string;
}) {
  await ingestEvent({
    source: "booking",
    ...params,
  });
}

/**
 * Track an email engagement event
 * Convenience method for email tracking
 */
export async function trackEmailEvent(params: {
  eventName: string;
  email: string;
  properties?: Record<string, any>;
  messageId?: string;
}) {
  await ingestEvent({
    source: "email",
    ...params,
  });
}

/**
 * Track a Meta Pixel event
 * Convenience method for Meta advertising events
 * Automatically forwards to CAPI with matching eventId for deduplication
 */
export async function trackMetaEvent(params: {
  eventName: string;
  properties?: Record<string, any>;
  fbp?: string;
  fbc?: string;
  externalId?: string;
  email?: string;
  eventId?: string; // For Pixel/CAPI deduplication
  eventSourceUrl?: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  await ingestEvent({
    source: "meta",
    ...params,
  });
}

/**
 * Get events for a person
 */
export async function getPersonEvents(personId: string, limit = 100) {
  return getEventsByPerson(personId, limit);
}

/**
 * Get events for a person in a date range
 */
export async function getPersonEventsByDateRange(
  personId: string,
  startDate: Date,
  endDate: Date
) {
  return getEventsByDateRange(personId, startDate, endDate);
}
