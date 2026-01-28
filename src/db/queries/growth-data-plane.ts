import { db } from "@/db";
import {
  person,
  identityLink,
  event,
  emailMessage,
  emailEvent,
  subscription,
  deal,
  personFeatures,
  segment,
} from "@/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";

// Person queries
export async function createPerson(data: {
  email?: string;
  phone?: string;
  name?: string;
  traits?: Record<string, any>;
}) {
  const [newPerson] = await db.insert(person).values(data).returning();
  return newPerson;
}

export async function getPersonById(id: string) {
  const [result] = await db.select().from(person).where(eq(person.id, id));
  return result;
}

export async function getPersonByEmail(email: string) {
  const [result] = await db.select().from(person).where(eq(person.email, email));
  return result;
}

export async function updatePerson(id: string, data: Partial<typeof person.$inferInsert>) {
  const [updated] = await db
    .update(person)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(person.id, id))
    .returning();
  return updated;
}

// Identity Link queries
export async function createIdentityLink(data: {
  personId: string;
  provider: "posthog" | "stripe" | "meta" | "app";
  externalId: string;
  metadata?: Record<string, any>;
}) {
  const [newLink] = await db.insert(identityLink).values(data).returning();
  return newLink;
}

export async function getIdentityLinksByPerson(personId: string) {
  return db.select().from(identityLink).where(eq(identityLink.personId, personId));
}

export async function findPersonByExternalId(provider: string, externalId: string) {
  const [link] = await db
    .select()
    .from(identityLink)
    .where(
      and(
        eq(identityLink.provider, provider as any),
        eq(identityLink.externalId, externalId)
      )
    );

  if (!link) return null;
  return getPersonById(link.personId);
}

// Event queries
export async function trackEvent(data: {
  personId?: string;
  eventName: string;
  source: "web" | "app" | "email" | "stripe" | "booking" | "meta";
  properties?: Record<string, any>;
  sessionId?: string;
  deviceId?: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  const [newEvent] = await db.insert(event).values(data).returning();
  return newEvent;
}

export async function getEventsByPerson(personId: string, limit = 100) {
  return db
    .select()
    .from(event)
    .where(eq(event.personId, personId))
    .orderBy(desc(event.timestamp))
    .limit(limit);
}

export async function getEventsByDateRange(
  personId: string,
  startDate: Date,
  endDate: Date
) {
  return db
    .select()
    .from(event)
    .where(
      and(
        eq(event.personId, personId),
        gte(event.timestamp, startDate),
        lte(event.timestamp, endDate)
      )
    )
    .orderBy(desc(event.timestamp));
}

// Email Message queries
export async function createEmailMessage(data: {
  personId?: string;
  messageId: string;
  subject?: string;
  template?: string;
  tags?: Record<string, any>;
}) {
  const [newMessage] = await db.insert(emailMessage).values(data).returning();
  return newMessage;
}

export async function getEmailMessageById(id: string) {
  const [result] = await db.select().from(emailMessage).where(eq(emailMessage.id, id));
  return result;
}

export async function getEmailMessageByMessageId(messageId: string) {
  const [result] = await db
    .select()
    .from(emailMessage)
    .where(eq(emailMessage.messageId, messageId));
  return result;
}

// Email Event queries
export async function createEmailEvent(data: {
  emailMessageId: string;
  eventType: "delivered" | "opened" | "clicked" | "bounced" | "complained" | "unsubscribed";
  link?: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  const [newEvent] = await db.insert(emailEvent).values(data).returning();
  return newEvent;
}

export async function getEmailEventsByMessage(emailMessageId: string) {
  return db
    .select()
    .from(emailEvent)
    .where(eq(emailEvent.emailMessageId, emailMessageId))
    .orderBy(desc(emailEvent.timestamp));
}

// Subscription queries
export async function upsertSubscription(data: {
  personId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: "active" | "canceled" | "past_due" | "trialing" | "paused";
  planName?: string;
  planInterval?: string;
  mrr?: number;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, any>;
}) {
  const existing = await db
    .select()
    .from(subscription)
    .where(eq(subscription.stripeSubscriptionId, data.stripeSubscriptionId))
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(subscription)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscription.stripeSubscriptionId, data.stripeSubscriptionId))
      .returning();
    return updated;
  }

  const [newSub] = await db.insert(subscription).values(data).returning();
  return newSub;
}

export async function getSubscriptionsByPerson(personId: string) {
  return db.select().from(subscription).where(eq(subscription.personId, personId));
}

// Deal queries
export async function createDeal(data: {
  personId: string;
  stage?: "lead" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  value?: number;
  source?: string;
  notes?: string;
}) {
  const [newDeal] = await db.insert(deal).values(data).returning();
  return newDeal;
}

export async function updateDealStage(
  id: string,
  stage: "lead" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost"
) {
  const [updated] = await db
    .update(deal)
    .set({ stage, updatedAt: new Date() })
    .where(eq(deal.id, id))
    .returning();
  return updated;
}

export async function getDealsByPerson(personId: string) {
  return db.select().from(deal).where(eq(deal.personId, personId));
}

// Person Features queries
export async function upsertPersonFeatures(data: {
  personId: string;
  activeDays?: number;
  coreActions?: number;
  pricingViews?: number;
  emailOpens?: number;
  emailClicks?: number;
  lastActiveAt?: Date;
}) {
  const existing = await db
    .select()
    .from(personFeatures)
    .where(eq(personFeatures.personId, data.personId))
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(personFeatures)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(personFeatures.personId, data.personId))
      .returning();
    return updated;
  }

  const [newFeatures] = await db.insert(personFeatures).values(data).returning();
  return newFeatures;
}

export async function incrementPersonFeature(
  personId: string,
  feature: "activeDays" | "coreActions" | "pricingViews" | "emailOpens" | "emailClicks"
) {
  const existing = await db
    .select()
    .from(personFeatures)
    .where(eq(personFeatures.personId, personId))
    .limit(1);

  if (existing.length === 0) {
    return upsertPersonFeatures({ personId, [feature]: 1 });
  }

  const currentValue = existing[0][feature] || 0;
  return upsertPersonFeatures({ personId, [feature]: currentValue + 1 });
}

export async function getPersonFeatures(personId: string) {
  const [result] = await db
    .select()
    .from(personFeatures)
    .where(eq(personFeatures.personId, personId));
  return result;
}

// Segment queries
export async function createSegment(data: {
  name: string;
  description?: string;
  criteria: Record<string, any>;
  automationConfig?: Record<string, any>;
}) {
  const [newSegment] = await db.insert(segment).values(data).returning();
  return newSegment;
}

export async function getActiveSegments() {
  return db.select().from(segment).where(eq(segment.isActive, true));
}

export async function updateSegment(id: string, data: Partial<typeof segment.$inferInsert>) {
  const [updated] = await db
    .update(segment)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(segment.id, id))
    .returning();
  return updated;
}
