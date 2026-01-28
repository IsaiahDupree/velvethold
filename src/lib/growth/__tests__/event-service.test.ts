/**
 * Event Service Tests
 *
 * Integration tests for the unified event ingestion system
 */

import { describe, it, expect, beforeAll } from "@jest/globals";
import {
  trackWebEvent,
  trackAppEvent,
  trackEmailEvent,
  trackStripeEvent,
  trackBookingEvent,
  getPersonEvents,
} from "../event-service";
import { getOrCreatePerson, linkIdentity } from "../identity-service";

describe("Event Service", () => {
  let testPersonId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create a test person
    const person = await getOrCreatePerson({
      email: "test@example.com",
      name: "Test User",
    });
    testPersonId = person.id;

    // Create a fake user ID for testing
    testUserId = "test-user-123";

    // Link the user ID to the person
    await linkIdentity(testPersonId, {
      provider: "app",
      externalId: testUserId,
    });
  });

  it("should track a web event", async () => {
    await expect(
      trackWebEvent({
        eventName: "page_view",
        personId: testPersonId,
        properties: { path: "/test" },
      })
    ).resolves.not.toThrow();
  });

  it("should track an app event with user resolution", async () => {
    await expect(
      trackAppEvent({
        eventName: "profile_created",
        userId: testUserId,
        properties: { step: "onboarding" },
      })
    ).resolves.not.toThrow();
  });

  it("should track an email event", async () => {
    await expect(
      trackEmailEvent({
        eventName: "email_opened",
        email: "test@example.com",
        properties: { campaign: "welcome" },
      })
    ).resolves.not.toThrow();
  });

  it("should retrieve person events", async () => {
    const events = await getPersonEvents(testPersonId, 10);
    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBeGreaterThan(0);
  });

  it("should track events from different sources", async () => {
    // Track multiple events
    await trackWebEvent({
      eventName: "landing_view",
      personId: testPersonId,
      utmParams: {
        source: "google",
        medium: "cpc",
        campaign: "test-campaign",
      },
    });

    await trackAppEvent({
      eventName: "core_action",
      userId: testUserId,
      properties: { action: "request_created" },
    });

    // Verify events were tracked
    const events = await getPersonEvents(testPersonId, 20);
    const eventNames = events.map((e) => e.eventName);

    expect(eventNames).toContain("landing_view");
    expect(eventNames).toContain("core_action");
  });

  it("should handle events with UTM parameters", async () => {
    await trackWebEvent({
      eventName: "cta_click",
      personId: testPersonId,
      properties: { buttonText: "Get Started" },
      utmParams: {
        source: "facebook",
        medium: "social",
        campaign: "summer-2024",
      },
    });

    const events = await getPersonEvents(testPersonId, 5);
    const ctaEvent = events.find((e) => e.eventName === "cta_click");

    expect(ctaEvent).toBeDefined();
    expect(ctaEvent?.properties).toHaveProperty("utm");
  });

  it("should handle booking events", async () => {
    await expect(
      trackBookingEvent({
        eventName: "request_submitted",
        userId: testUserId,
        requestId: "test-request-123",
        properties: {
          depositAmount: 5000,
          inviteeId: "test-invitee-456",
        },
      })
    ).resolves.not.toThrow();
  });
});
