/**
 * Event Tracking API
 *
 * Unified endpoint for tracking events from all sources
 * POST /api/growth/events/track
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  ingestEvent,
  trackWebEvent,
  trackAppEvent,
  trackEmailEvent,
  trackStripeEvent,
  trackBookingEvent,
  trackMetaEvent,
  type EventData,
} from "@/lib/growth/event-service";
import { z } from "zod";

// Validation schemas for different event types
const baseEventSchema = z.object({
  eventName: z.string().min(1),
  properties: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional(),
  sessionId: z.string().optional(),
  deviceId: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

const webEventSchema = baseEventSchema.extend({
  source: z.literal("web"),
  personId: z.string().optional(),
  anonymousId: z.string().optional(),
  utmParams: z
    .object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
      term: z.string().optional(),
      content: z.string().optional(),
    })
    .optional(),
});

const appEventSchema = baseEventSchema.extend({
  source: z.literal("app"),
  userId: z.string(),
});

const emailEventSchema = baseEventSchema.extend({
  source: z.literal("email"),
  email: z.string().email(),
  messageId: z.string().optional(),
});

const stripeEventSchema = baseEventSchema.extend({
  source: z.literal("stripe"),
  stripeCustomerId: z.string(),
  stripeEventId: z.string().optional(),
});

const bookingEventSchema = baseEventSchema.extend({
  source: z.literal("booking"),
  userId: z.string(),
  requestId: z.string().optional(),
});

const metaEventSchema = baseEventSchema.extend({
  source: z.literal("meta"),
  fbp: z.string().optional(),
  fbc: z.string().optional(),
  externalId: z.string().optional(),
});

const eventSchema = z.discriminatedUnion("source", [
  webEventSchema,
  appEventSchema,
  emailEventSchema,
  stripeEventSchema,
  bookingEventSchema,
  metaEventSchema,
]);

/**
 * POST /api/growth/events/track
 * Track an event from any source
 *
 * Body examples:
 * - Web: { source: "web", eventName: "page_view", properties: {...}, utmParams: {...} }
 * - App: { source: "app", eventName: "profile_created", userId: "..." }
 * - Email: { source: "email", eventName: "email_opened", email: "..." }
 * - Stripe: { source: "stripe", eventName: "payment_succeeded", stripeCustomerId: "..." }
 * - Booking: { source: "booking", eventName: "request_created", userId: "...", requestId: "..." }
 * - Meta: { source: "meta", eventName: "Purchase", properties: {...}, externalId: "..." }
 */
export async function POST(req: Request) {
  try {
    // Parse request body
    const body = await req.json();

    // Validate event data
    const validationResult = eventSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid event data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const eventData = validationResult.data;

    // Extract request metadata
    const userAgent = req.headers.get("user-agent") || undefined;
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;

    // Add metadata to event if not already provided
    const enrichedEventData = {
      ...eventData,
      userAgent: eventData.userAgent || userAgent,
      ipAddress: eventData.ipAddress || ipAddress,
    } as EventData;

    // Track the event
    await ingestEvent(enrichedEventData);

    return NextResponse.json({
      success: true,
      message: "Event tracked successfully",
    });
  } catch (error) {
    console.error("Error tracking event:", error);
    return NextResponse.json(
      {
        error: "Failed to track event",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/growth/events/track
 * Get events for the current user (requires authentication)
 */
export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get person ID from app user
    const { getPersonIdFromUserId } = await import("@/lib/growth/identity-service");
    const personId = await getPersonIdFromUserId(session.user.id);

    if (!personId) {
      return NextResponse.json(
        { error: "Person not found for user" },
        { status: 404 }
      );
    }

    // Get events
    const { getPersonEvents } = await import("@/lib/growth/event-service");
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const events = await getPersonEvents(personId, limit);

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
