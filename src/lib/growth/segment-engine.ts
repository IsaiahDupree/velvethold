/**
 * Segment Engine
 *
 * Evaluates segment membership based on person features and triggers automations
 * Supports:
 * - Feature-based segmentation (active_days, core_actions, etc.)
 * - Subscription-based segmentation (plan, MRR, status)
 * - Event-based segmentation (recent events)
 * - Automation triggers (Resend campaigns, Meta audiences, outbound webhooks)
 */

import { db } from "@/db";
import { person, personFeatures, subscription, event, segment } from "@/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import {
  getActiveSegments,
  addPersonToSegment,
  removePersonFromSegment,
  getPersonSegmentMemberships,
  getSegmentMembers,
} from "@/db/queries/growth-data-plane";

/**
 * Segment criteria structure
 * Each condition can be a simple comparison or a range
 */
export interface SegmentCriteria {
  features?: {
    activeDays?: { min?: number; max?: number; eq?: number };
    coreActions?: { min?: number; max?: number; eq?: number };
    pricingViews?: { min?: number; max?: number; eq?: number };
    emailOpens?: { min?: number; max?: number; eq?: number };
    emailClicks?: { min?: number; max?: number; eq?: number };
  };
  subscription?: {
    status?: ("active" | "canceled" | "past_due" | "trialing" | "paused")[];
    planName?: string[];
    mrrMin?: number;
    mrrMax?: number;
  };
  events?: {
    eventName: string;
    count?: { min?: number; max?: number };
    within?: number; // days
  }[];
  person?: {
    hasEmail?: boolean;
    hasPhone?: boolean;
  };
}

/**
 * Automation configuration structure
 */
export interface AutomationConfig {
  resend?: {
    audienceId?: string;
    campaignId?: string;
    trigger?: "on_enter" | "on_exit";
  };
  meta?: {
    customAudienceId?: string;
    action?: "add" | "remove";
  };
  webhook?: {
    url: string;
    method?: "POST" | "PUT";
    headers?: Record<string, string>;
  };
}

/**
 * Evaluate if a person matches segment criteria
 */
export async function evaluateSegmentMembership(
  personId: string,
  criteria: SegmentCriteria
): Promise<boolean> {
  // Get person data
  const [personData] = await db
    .select()
    .from(person)
    .where(eq(person.id, personId))
    .limit(1);

  if (!personData) return false;

  // Check person criteria
  if (criteria.person) {
    if (criteria.person.hasEmail !== undefined) {
      const hasEmail = !!personData.email;
      if (hasEmail !== criteria.person.hasEmail) return false;
    }
    if (criteria.person.hasPhone !== undefined) {
      const hasPhone = !!personData.phone;
      if (hasPhone !== criteria.person.hasPhone) return false;
    }
  }

  // Check feature criteria
  if (criteria.features) {
    const [features] = await db
      .select()
      .from(personFeatures)
      .where(eq(personFeatures.personId, personId))
      .limit(1);

    if (!features) return false; // No features computed yet

    for (const [featureName, condition] of Object.entries(criteria.features)) {
      const value = features[featureName as keyof typeof features] as number | null;
      if (value === null || value === undefined) return false;

      if (condition.eq !== undefined && value !== condition.eq) return false;
      if (condition.min !== undefined && value < condition.min) return false;
      if (condition.max !== undefined && value > condition.max) return false;
    }
  }

  // Check subscription criteria
  if (criteria.subscription) {
    const subscriptions = await db
      .select()
      .from(subscription)
      .where(eq(subscription.personId, personId));

    if (subscriptions.length === 0) return false;

    // Check if any subscription matches the criteria
    const matchesSubscription = subscriptions.some((sub) => {
      if (criteria.subscription!.status && !criteria.subscription!.status.includes(sub.status)) {
        return false;
      }
      if (
        criteria.subscription!.planName &&
        (!sub.planName || !criteria.subscription!.planName.includes(sub.planName))
      ) {
        return false;
      }
      if (criteria.subscription!.mrrMin && (!sub.mrr || sub.mrr < criteria.subscription!.mrrMin)) {
        return false;
      }
      if (criteria.subscription!.mrrMax && (!sub.mrr || sub.mrr > criteria.subscription!.mrrMax)) {
        return false;
      }
      return true;
    });

    if (!matchesSubscription) return false;
  }

  // Check event criteria
  if (criteria.events && criteria.events.length > 0) {
    for (const eventCriteria of criteria.events) {
      let query = db
        .select({ count: sql<number>`COUNT(*)` })
        .from(event)
        .where(
          and(
            eq(event.personId, personId),
            eq(event.eventName, eventCriteria.eventName)
          )
        );

      // Add time window if specified
      if (eventCriteria.within) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - eventCriteria.within);
        query = db
          .select({ count: sql<number>`COUNT(*)` })
          .from(event)
          .where(
            and(
              eq(event.personId, personId),
              eq(event.eventName, eventCriteria.eventName),
              gte(event.timestamp, cutoffDate)
            )
          );
      }

      const [result] = await query;
      const count = result?.count || 0;

      if (eventCriteria.count) {
        if (eventCriteria.count.min !== undefined && count < eventCriteria.count.min) {
          return false;
        }
        if (eventCriteria.count.max !== undefined && count > eventCriteria.count.max) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Get all segments a person belongs to
 */
export async function getPersonSegments(personId: string): Promise<string[]> {
  const segments = await getActiveSegments();
  const memberSegments: string[] = [];

  for (const seg of segments) {
    const isMember = await evaluateSegmentMembership(
      personId,
      seg.criteria as SegmentCriteria
    );
    if (isMember) {
      memberSegments.push(seg.id);
    }
  }

  return memberSegments;
}

/**
 * Trigger automations for a segment
 */
export async function triggerSegmentAutomations(
  segmentId: string,
  personId: string,
  action: "on_enter" | "on_exit"
): Promise<void> {
  // Get segment configuration
  const [segmentData] = await db
    .select()
    .from(segment)
    .where(eq(segment.id, segmentId))
    .limit(1);

  if (!segmentData || !segmentData.automationConfig) return;

  const config = segmentData.automationConfig as AutomationConfig;

  // Get person data for automations
  const [personData] = await db
    .select()
    .from(person)
    .where(eq(person.id, personId))
    .limit(1);

  if (!personData) return;

  // Trigger Resend automations
  if (config.resend && config.resend.trigger === action) {
    await triggerResendAutomation(personData, config.resend);
  }

  // Trigger Meta automations
  if (config.meta) {
    await triggerMetaAutomation(personData, config.meta, action);
  }

  // Trigger webhook automations
  if (config.webhook) {
    await triggerWebhookAutomation(personData, config.webhook, {
      segmentId,
      segmentName: segmentData.name,
      action,
    });
  }
}

/**
 * Trigger Resend automation (add to audience or send campaign)
 */
async function triggerResendAutomation(
  personData: typeof person.$inferSelect,
  config: NonNullable<AutomationConfig["resend"]>
): Promise<void> {
  if (!personData.email) return;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Add to audience
    if (config.audienceId) {
      await resend.contacts.create({
        email: personData.email,
        firstName: personData.name || undefined,
        audienceId: config.audienceId,
      });
    }

    // Send campaign (if campaignId is provided)
    // Note: Resend doesn't have a direct campaign API, so this would need custom implementation
    // For now, we'll just log it
    if (config.campaignId) {
      console.log(`Would trigger campaign ${config.campaignId} for ${personData.email}`);
    }
  } catch (error) {
    console.error("Failed to trigger Resend automation:", error);
  }
}

/**
 * Trigger Meta custom audience automation
 */
async function triggerMetaAutomation(
  personData: typeof person.$inferSelect,
  config: NonNullable<AutomationConfig["meta"]>,
  action: "on_enter" | "on_exit"
): Promise<void> {
  if (!personData.email || !config.customAudienceId) return;

  try {
    // Import Meta CAPI client
    const { addToCustomAudience, removeFromCustomAudience } = await import("../meta/custom-audiences");

    const shouldAdd = (action === "on_enter" && config.action === "add") ||
                     (action === "on_exit" && config.action === "remove");

    if (shouldAdd) {
      await addToCustomAudience(config.customAudienceId, [personData.email]);
    } else {
      await removeFromCustomAudience(config.customAudienceId, [personData.email]);
    }
  } catch (error) {
    console.error("Failed to trigger Meta automation:", error);
  }
}

/**
 * Trigger webhook automation
 */
async function triggerWebhookAutomation(
  personData: typeof person.$inferSelect,
  config: NonNullable<AutomationConfig["webhook"]>,
  metadata: { segmentId: string; segmentName: string; action: string }
): Promise<void> {
  try {
    const response = await fetch(config.url, {
      method: config.method || "POST",
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: JSON.stringify({
        personId: personData.id,
        email: personData.email,
        phone: personData.phone,
        name: personData.name,
        traits: personData.traits,
        segment: metadata,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Failed to trigger webhook automation:", error);
  }
}

/**
 * Evaluate segment membership after an event and trigger automations
 * This is called from the event ingestion pipeline
 */
export async function evaluateSegmentsAfterEvent(personId: string): Promise<void> {
  // Get current evaluated membership
  const currentSegments = await getPersonSegments(personId);
  const currentSegmentSet = new Set(currentSegments);

  // Get previous stored membership
  const previousMemberships = await getPersonSegmentMemberships(personId);
  const previousSegmentSet = new Set(previousMemberships.map((m) => m.segmentId));

  // Find segments entered (in current but not in previous)
  const enteredSegments = currentSegments.filter((id) => !previousSegmentSet.has(id));

  // Find segments exited (in previous but not in current)
  const exitedSegments = previousMemberships
    .map((m) => m.segmentId)
    .filter((id) => !currentSegmentSet.has(id));

  // Handle segments entered
  for (const segmentId of enteredSegments) {
    await addPersonToSegment(personId, segmentId);
    await triggerSegmentAutomations(segmentId, personId, "on_enter").catch((error) => {
      console.error(`Failed to trigger on_enter automations for segment ${segmentId}:`, error);
    });
  }

  // Handle segments exited
  for (const segmentId of exitedSegments) {
    await removePersonFromSegment(personId, segmentId);
    await triggerSegmentAutomations(segmentId, personId, "on_exit").catch((error) => {
      console.error(`Failed to trigger on_exit automations for segment ${segmentId}:`, error);
    });
  }
}

/**
 * Batch evaluate segments for multiple people
 * Useful for scheduled jobs or backfilling
 */
export async function batchEvaluateSegments(personIds: string[]): Promise<void> {
  for (const personId of personIds) {
    try {
      await evaluateSegmentsAfterEvent(personId);
    } catch (error) {
      console.error(`Failed to evaluate segments for person ${personId}:`, error);
    }
  }
}

/**
 * Get segment membership statistics
 */
export async function getSegmentStats(segmentId: string): Promise<{
  segmentId: string;
  memberCount: number;
}> {
  const [segmentData] = await db
    .select()
    .from(segment)
    .where(eq(segment.id, segmentId))
    .limit(1);

  if (!segmentData) {
    return { segmentId, memberCount: 0 };
  }

  // Get all persons and check membership
  const allPersons = await db.select({ id: person.id }).from(person);
  let memberCount = 0;

  for (const p of allPersons) {
    const isMember = await evaluateSegmentMembership(
      p.id,
      segmentData.criteria as SegmentCriteria
    );
    if (isMember) memberCount++;
  }

  return { segmentId, memberCount };
}
