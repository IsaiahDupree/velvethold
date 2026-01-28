import { db } from "@/db";
import { availabilityRules, availabilitySlots } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

// ===========================
// AVAILABILITY RULES QUERIES
// ===========================

export interface CreateAvailabilityRuleInput {
  profileId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  active?: boolean;
}

export interface UpdateAvailabilityRuleInput {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  active?: boolean;
}

/**
 * Create a new availability rule for a profile
 */
export async function createAvailabilityRule(input: CreateAvailabilityRuleInput) {
  const [rule] = await db
    .insert(availabilityRules)
    .values({
      profileId: input.profileId,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      active: input.active ?? true,
    })
    .returning();

  return rule;
}

/**
 * Get all availability rules for a profile
 */
export async function getAvailabilityRulesByProfileId(profileId: string) {
  return await db
    .select()
    .from(availabilityRules)
    .where(eq(availabilityRules.profileId, profileId))
    .orderBy(availabilityRules.dayOfWeek);
}

/**
 * Get active availability rules for a profile
 */
export async function getActiveAvailabilityRules(profileId: string) {
  return await db
    .select()
    .from(availabilityRules)
    .where(
      and(
        eq(availabilityRules.profileId, profileId),
        eq(availabilityRules.active, true)
      )
    )
    .orderBy(availabilityRules.dayOfWeek);
}

/**
 * Get a specific availability rule by ID
 */
export async function getAvailabilityRuleById(id: string) {
  const [rule] = await db
    .select()
    .from(availabilityRules)
    .where(eq(availabilityRules.id, id))
    .limit(1);

  return rule;
}

/**
 * Update an availability rule
 */
export async function updateAvailabilityRule(
  id: string,
  input: UpdateAvailabilityRuleInput
) {
  const [updated] = await db
    .update(availabilityRules)
    .set(input)
    .where(eq(availabilityRules.id, id))
    .returning();

  return updated;
}

/**
 * Delete an availability rule
 */
export async function deleteAvailabilityRule(id: string) {
  const [deleted] = await db
    .delete(availabilityRules)
    .where(eq(availabilityRules.id, id))
    .returning();

  return deleted;
}

/**
 * Delete all availability rules for a profile
 */
export async function deleteAvailabilityRulesByProfileId(profileId: string) {
  return await db
    .delete(availabilityRules)
    .where(eq(availabilityRules.profileId, profileId))
    .returning();
}

/**
 * Create multiple availability rules at once
 */
export async function createAvailabilityRules(inputs: CreateAvailabilityRuleInput[]) {
  if (inputs.length === 0) return [];

  return await db
    .insert(availabilityRules)
    .values(inputs.map(input => ({
      profileId: input.profileId,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      active: input.active ?? true,
    })))
    .returning();
}

// ===========================
// AVAILABILITY SLOTS QUERIES
// ===========================

export interface CreateAvailabilitySlotInput {
  profileId: string;
  startDatetime: Date;
  endDatetime: Date;
  status?: "open" | "requested" | "booked" | "completed";
}

export interface UpdateAvailabilitySlotInput {
  startDatetime?: Date;
  endDatetime?: Date;
  status?: "open" | "requested" | "booked" | "completed";
}

/**
 * Create a new availability slot
 */
export async function createAvailabilitySlot(input: CreateAvailabilitySlotInput) {
  const [slot] = await db
    .insert(availabilitySlots)
    .values({
      profileId: input.profileId,
      startDatetime: input.startDatetime,
      endDatetime: input.endDatetime,
      status: input.status ?? "open",
    })
    .returning();

  return slot;
}

/**
 * Get all availability slots for a profile
 */
export async function getAvailabilitySlotsByProfileId(
  profileId: string,
  startDate?: Date,
  endDate?: Date
) {
  const conditions = [eq(availabilitySlots.profileId, profileId)];

  if (startDate) {
    conditions.push(gte(availabilitySlots.startDatetime, startDate));
  }
  if (endDate) {
    conditions.push(lte(availabilitySlots.endDatetime, endDate));
  }

  return await db
    .select()
    .from(availabilitySlots)
    .where(and(...conditions))
    .orderBy(availabilitySlots.startDatetime);
}

/**
 * Get open availability slots for a profile
 */
export async function getOpenAvailabilitySlots(
  profileId: string,
  startDate?: Date,
  endDate?: Date
) {
  const conditions = [
    eq(availabilitySlots.profileId, profileId),
    eq(availabilitySlots.status, "open"),
  ];

  if (startDate) {
    conditions.push(gte(availabilitySlots.startDatetime, startDate));
  }
  if (endDate) {
    conditions.push(lte(availabilitySlots.endDatetime, endDate));
  }

  return await db
    .select()
    .from(availabilitySlots)
    .where(and(...conditions))
    .orderBy(availabilitySlots.startDatetime);
}

/**
 * Get a specific availability slot by ID
 */
export async function getAvailabilitySlotById(id: string) {
  const [slot] = await db
    .select()
    .from(availabilitySlots)
    .where(eq(availabilitySlots.id, id))
    .limit(1);

  return slot;
}

/**
 * Update an availability slot
 */
export async function updateAvailabilitySlot(
  id: string,
  input: UpdateAvailabilitySlotInput
) {
  const [updated] = await db
    .update(availabilitySlots)
    .set(input)
    .where(eq(availabilitySlots.id, id))
    .returning();

  return updated;
}

/**
 * Delete an availability slot
 */
export async function deleteAvailabilitySlot(id: string) {
  const [deleted] = await db
    .delete(availabilitySlots)
    .where(eq(availabilitySlots.id, id))
    .returning();

  return deleted;
}

/**
 * Delete all availability slots for a profile
 */
export async function deleteAvailabilitySlotsByProfileId(profileId: string) {
  return await db
    .delete(availabilitySlots)
    .where(eq(availabilitySlots.profileId, profileId))
    .returning();
}

/**
 * Create multiple availability slots at once
 */
export async function createAvailabilitySlots(inputs: CreateAvailabilitySlotInput[]) {
  if (inputs.length === 0) return [];

  return await db
    .insert(availabilitySlots)
    .values(inputs.map(input => ({
      profileId: input.profileId,
      startDatetime: input.startDatetime,
      endDatetime: input.endDatetime,
      status: input.status ?? "open",
    })))
    .returning();
}

/**
 * Mark a slot as booked
 */
export async function bookAvailabilitySlot(id: string) {
  return await updateAvailabilitySlot(id, { status: "booked" });
}

/**
 * Mark a slot as blocked (using 'completed' status)
 */
export async function blockAvailabilitySlot(id: string) {
  return await updateAvailabilitySlot(id, { status: "completed" });
}

/**
 * Mark a slot as open
 */
export async function openAvailabilitySlot(id: string) {
  return await updateAvailabilitySlot(id, { status: "open" });
}
