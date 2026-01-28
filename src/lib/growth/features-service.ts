/**
 * Person Features Computation Service
 *
 * Computes behavioral features from events for segmentation:
 * - active_days: Number of unique days with activity
 * - core_actions: Count of key product actions (profile_created, date_requested, date_approved, etc.)
 * - pricing_views: Number of times pricing page was viewed
 * - email_opens: Count of email open events
 */

import { db } from "@/db";
import { event, emailEvent, emailMessage, personFeatures } from "@/db/schema";
import { eq, and, sql, gte } from "drizzle-orm";
import { upsertPersonFeatures } from "@/db/queries/growth-data-plane";

/**
 * Core action event names
 * These are high-value product actions that indicate engagement
 */
const CORE_ACTION_EVENTS = [
  "profile_created",
  "profile_completed",
  "date_request_created",
  "date_request_approved",
  "date_confirmed",
  "payment_completed",
  "message_sent",
  "verification_completed",
  "signup_completed",
];

/**
 * Pricing-related event names
 */
const PRICING_EVENTS = [
  "pricing_view",
  "pricing_page_view",
];

/**
 * Compute active days from events
 * Returns the count of unique calendar days with activity
 */
export async function computeActiveDays(personId: string): Promise<number> {
  const result = await db
    .select({
      activeDays: sql<number>`COUNT(DISTINCT DATE(${event.timestamp}))`,
    })
    .from(event)
    .where(eq(event.personId, personId));

  return result[0]?.activeDays || 0;
}

/**
 * Compute core actions count from events
 * Counts occurrences of key product events
 */
export async function computeCoreActions(personId: string): Promise<number> {
  const result = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(event)
    .where(
      and(
        eq(event.personId, personId),
        sql`${event.eventName} = ANY(${CORE_ACTION_EVENTS})`
      )
    );

  return result[0]?.count || 0;
}

/**
 * Compute pricing views from events
 * Counts how many times user viewed pricing information
 */
export async function computePricingViews(personId: string): Promise<number> {
  const result = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(event)
    .where(
      and(
        eq(event.personId, personId),
        sql`${event.eventName} = ANY(${PRICING_EVENTS})`
      )
    );

  return result[0]?.count || 0;
}

/**
 * Compute email opens from email events
 * Counts email open events for this person
 */
export async function computeEmailOpens(personId: string): Promise<number> {
  const result = await db
    .select({
      count: sql<number>`COUNT(DISTINCT ${emailEvent.id})`,
    })
    .from(emailEvent)
    .innerJoin(emailMessage, eq(emailEvent.emailMessageId, emailMessage.id))
    .where(
      and(
        eq(emailMessage.personId, personId),
        eq(emailEvent.eventType, "opened")
      )
    );

  return result[0]?.count || 0;
}

/**
 * Compute email clicks from email events
 * Counts email click events for this person
 */
export async function computeEmailClicks(personId: string): Promise<number> {
  const result = await db
    .select({
      count: sql<number>`COUNT(DISTINCT ${emailEvent.id})`,
    })
    .from(emailEvent)
    .innerJoin(emailMessage, eq(emailEvent.emailMessageId, emailMessage.id))
    .where(
      and(
        eq(emailMessage.personId, personId),
        eq(emailEvent.eventType, "clicked")
      )
    );

  return result[0]?.count || 0;
}

/**
 * Get last active timestamp from events
 */
export async function getLastActiveAt(personId: string): Promise<Date | null> {
  const result = await db
    .select({
      lastActive: sql<Date>`MAX(${event.timestamp})`,
    })
    .from(event)
    .where(eq(event.personId, personId));

  return result[0]?.lastActive || null;
}

/**
 * Compute all features for a person and update personFeatures table
 * This is the main entry point for feature computation
 */
export async function computePersonFeatures(personId: string): Promise<void> {
  // Compute all features in parallel for efficiency
  const [activeDays, coreActions, pricingViews, emailOpens, emailClicks, lastActiveAt] =
    await Promise.all([
      computeActiveDays(personId),
      computeCoreActions(personId),
      computePricingViews(personId),
      computeEmailOpens(personId),
      computeEmailClicks(personId),
      getLastActiveAt(personId),
    ]);

  // Upsert into personFeatures table
  await upsertPersonFeatures({
    personId,
    activeDays,
    coreActions,
    pricingViews,
    emailOpens,
    emailClicks,
    lastActiveAt: lastActiveAt || undefined,
  });
}

/**
 * Batch compute features for multiple people
 * Useful for backfilling or scheduled updates
 */
export async function batchComputePersonFeatures(personIds: string[]): Promise<void> {
  for (const personId of personIds) {
    try {
      await computePersonFeatures(personId);
    } catch (error) {
      console.error(`Failed to compute features for person ${personId}:`, error);
      // Continue processing other people
    }
  }
}

/**
 * Compute features for all people with recent activity
 * Useful for scheduled jobs
 */
export async function computeFeaturesForRecentActivity(daysBack: number = 7): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  // Get unique person IDs with recent activity
  const recentPeople = await db
    .selectDistinct({ personId: event.personId })
    .from(event)
    .where(
      and(
        sql`${event.personId} IS NOT NULL`,
        gte(event.timestamp, cutoffDate)
      )
    );

  const personIds = recentPeople
    .map((p) => p.personId)
    .filter((id): id is string => id !== null);

  await batchComputePersonFeatures(personIds);
}

/**
 * Incrementally update features after a new event
 * More efficient than full recomputation for real-time updates
 */
export async function incrementalUpdateFeatures(
  personId: string,
  eventName: string,
  timestamp: Date
): Promise<void> {
  // Get current features
  const current = await db
    .select()
    .from(personFeatures)
    .where(eq(personFeatures.personId, personId))
    .limit(1);

  const updates: any = {
    personId,
    lastActiveAt: timestamp,
  };

  // Increment core actions if this is a core action event
  if (CORE_ACTION_EVENTS.includes(eventName)) {
    updates.coreActions = (current[0]?.coreActions || 0) + 1;
  }

  // Increment pricing views if this is a pricing event
  if (PRICING_EVENTS.includes(eventName)) {
    updates.pricingViews = (current[0]?.pricingViews || 0) + 1;
  }

  // Update active days (need to check if this is a new day)
  // For simplicity, we'll do a full recomputation of active days
  updates.activeDays = await computeActiveDays(personId);

  await upsertPersonFeatures(updates);
}
