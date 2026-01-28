/**
 * Email Event Tracking Test (GDP-005)
 *
 * This test verifies that email events from Resend webhooks are properly tracked.
 *
 * Test Coverage:
 * - Email message creation
 * - Delivered event tracking
 * - Opened event tracking
 * - Clicked event tracking
 * - Bounced event tracking
 * - Complained event tracking
 */

import { describe, test, expect, beforeAll } from "@jest/globals";
import {
  createPerson,
  createEmailMessage,
  createEmailEvent,
  getEmailMessageByMessageId,
  getEmailEventsByMessage,
} from "@/db/queries/growth-data-plane";

describe("Email Event Tracking (GDP-005)", () => {
  let testPersonId: string;
  let testEmailMessageId: string;
  const testResendMessageId = "test-resend-" + Date.now();

  beforeAll(async () => {
    // Create test person
    const person = await createPerson({
      email: "test@example.com",
      name: "Test User",
    });
    testPersonId = person.id;

    // Create test email message
    const emailMessage = await createEmailMessage({
      personId: testPersonId,
      messageId: testResendMessageId,
      subject: "Test Email",
      template: "test_template",
      tags: { type: "test" },
    });
    testEmailMessageId = emailMessage.id;
  });

  test("should retrieve email message by Resend message ID", async () => {
    const emailMessage = await getEmailMessageByMessageId(testResendMessageId);
    expect(emailMessage).toBeDefined();
    expect(emailMessage?.messageId).toBe(testResendMessageId);
    expect(emailMessage?.personId).toBe(testPersonId);
    expect(emailMessage?.subject).toBe("Test Email");
  });

  test("should track email delivered event", async () => {
    const deliveredEvent = await createEmailEvent({
      emailMessageId: testEmailMessageId,
      eventType: "delivered",
    });

    expect(deliveredEvent).toBeDefined();
    expect(deliveredEvent.eventType).toBe("delivered");
    expect(deliveredEvent.emailMessageId).toBe(testEmailMessageId);

    const events = await getEmailEventsByMessage(testEmailMessageId);
    const deliveredEvents = events.filter((e) => e.eventType === "delivered");
    expect(deliveredEvents.length).toBeGreaterThan(0);
  });

  test("should track email opened event with metadata", async () => {
    const openedEvent = await createEmailEvent({
      emailMessageId: testEmailMessageId,
      eventType: "opened",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      ipAddress: "192.168.1.1",
    });

    expect(openedEvent).toBeDefined();
    expect(openedEvent.eventType).toBe("opened");
    expect(openedEvent.userAgent).toBe("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)");
    expect(openedEvent.ipAddress).toBe("192.168.1.1");

    const events = await getEmailEventsByMessage(testEmailMessageId);
    const openedEvents = events.filter((e) => e.eventType === "opened");
    expect(openedEvents.length).toBeGreaterThan(0);
  });

  test("should track email clicked event with link", async () => {
    const clickedEvent = await createEmailEvent({
      emailMessageId: testEmailMessageId,
      eventType: "clicked",
      link: "https://velvethold.com/browse",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      ipAddress: "192.168.1.1",
    });

    expect(clickedEvent).toBeDefined();
    expect(clickedEvent.eventType).toBe("clicked");
    expect(clickedEvent.link).toBe("https://velvethold.com/browse");

    const events = await getEmailEventsByMessage(testEmailMessageId);
    const clickedEvents = events.filter((e) => e.eventType === "clicked");
    expect(clickedEvents.length).toBeGreaterThan(0);
  });

  test("should track email bounced event", async () => {
    const bouncedEvent = await createEmailEvent({
      emailMessageId: testEmailMessageId,
      eventType: "bounced",
    });

    expect(bouncedEvent).toBeDefined();
    expect(bouncedEvent.eventType).toBe("bounced");

    const events = await getEmailEventsByMessage(testEmailMessageId);
    const bouncedEvents = events.filter((e) => e.eventType === "bounced");
    expect(bouncedEvents.length).toBeGreaterThan(0);
  });

  test("should track email complained event", async () => {
    const complainedEvent = await createEmailEvent({
      emailMessageId: testEmailMessageId,
      eventType: "complained",
    });

    expect(complainedEvent).toBeDefined();
    expect(complainedEvent.eventType).toBe("complained");

    const events = await getEmailEventsByMessage(testEmailMessageId);
    const complainedEvents = events.filter((e) => e.eventType === "complained");
    expect(complainedEvents.length).toBeGreaterThan(0);
  });

  test("should retrieve all events for an email message", async () => {
    const allEvents = await getEmailEventsByMessage(testEmailMessageId);

    // Should have at least 5 events (delivered, opened, clicked, bounced, complained)
    expect(allEvents.length).toBeGreaterThanOrEqual(5);

    // Check all event types are present
    const eventTypes = allEvents.map((e) => e.eventType);
    expect(eventTypes).toContain("delivered");
    expect(eventTypes).toContain("opened");
    expect(eventTypes).toContain("clicked");
    expect(eventTypes).toContain("bounced");
    expect(eventTypes).toContain("complained");

    // Events should be ordered by timestamp (most recent first)
    for (let i = 0; i < allEvents.length - 1; i++) {
      expect(allEvents[i].timestamp.getTime()).toBeGreaterThanOrEqual(
        allEvents[i + 1].timestamp.getTime()
      );
    }
  });
});
