import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq, and, or, sql, ilike, gte, lte } from "drizzle-orm";

export interface CreateProfileInput {
  userId: string;
  displayName: string;
  age: number;
  city: string;
  bio?: string;
  intent?: "dating" | "relationship" | "friends";
  datePreferences?: Record<string, any>;
  boundaries?: string;
  screeningQuestions?: Record<string, any>;
  depositAmount?: number;
  cancellationPolicy?: string;
  availabilityVisibility?: "public" | "verified" | "paid" | "approved";
}

export interface UpdateProfileInput {
  displayName?: string;
  age?: number;
  city?: string;
  bio?: string;
  intent?: "dating" | "relationship" | "friends";
  datePreferences?: Record<string, any>;
  boundaries?: string;
  screeningQuestions?: Record<string, any>;
  depositAmount?: number;
  cancellationPolicy?: string;
  availabilityVisibility?: "public" | "verified" | "paid" | "approved";
}

export interface SearchProfilesInput {
  query?: string;
  intent?: "dating" | "relationship" | "friends";
  city?: string;
  minAge?: number;
  maxAge?: number;
  limit?: number;
  offset?: number;
}

/**
 * Create a new profile for a user
 */
export async function createProfile(input: CreateProfileInput) {
  const [profile] = await db
    .insert(profiles)
    .values({
      userId: input.userId,
      displayName: input.displayName,
      age: input.age,
      city: input.city,
      bio: input.bio,
      intent: input.intent || "dating",
      datePreferences: input.datePreferences,
      boundaries: input.boundaries,
      screeningQuestions: input.screeningQuestions,
      depositAmount: input.depositAmount,
      cancellationPolicy: input.cancellationPolicy,
      availabilityVisibility: input.availabilityVisibility,
    })
    .returning();

  return profile;
}

/**
 * Get profile by ID
 */
export async function getProfileById(id: string) {
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
  return profile || null;
}

/**
 * Get profile by user ID
 */
export async function getProfileByUserId(userId: string) {
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
  return profile || null;
}

/**
 * Update profile information
 */
export async function updateProfile(id: string, input: UpdateProfileInput) {
  const updateData: any = {
    ...input,
    updatedAt: new Date(),
  };

  const [profile] = await db
    .update(profiles)
    .set(updateData)
    .where(eq(profiles.id, id))
    .returning();

  return profile || null;
}

/**
 * Update profile by user ID
 */
export async function updateProfileByUserId(userId: string, input: UpdateProfileInput) {
  const updateData: any = {
    ...input,
    updatedAt: new Date(),
  };

  const [profile] = await db
    .update(profiles)
    .set(updateData)
    .where(eq(profiles.userId, userId))
    .returning();

  return profile || null;
}

/**
 * Delete profile
 */
export async function deleteProfile(id: string) {
  const [profile] = await db.delete(profiles).where(eq(profiles.id, id)).returning();
  return profile || null;
}

/**
 * Delete profile by user ID
 */
export async function deleteProfileByUserId(userId: string) {
  const [profile] = await db.delete(profiles).where(eq(profiles.userId, userId)).returning();
  return profile || null;
}

/**
 * Search profiles with filters
 */
export async function searchProfiles(input: SearchProfilesInput = {}) {
  const { query, intent, city, minAge, maxAge, limit = 50, offset = 0 } = input;

  const conditions = [];

  if (query) {
    conditions.push(
      or(
        ilike(profiles.displayName, `%${query}%`),
        ilike(profiles.bio, `%${query}%`)
      )
    );
  }

  if (intent) {
    conditions.push(eq(profiles.intent, intent));
  }

  if (city) {
    conditions.push(ilike(profiles.city, `%${city}%`));
  }

  if (minAge !== undefined) {
    conditions.push(gte(profiles.age, minAge));
  }

  if (maxAge !== undefined) {
    conditions.push(lte(profiles.age, maxAge));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const results = await db
    .select()
    .from(profiles)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(profiles.createdAt);

  return results;
}

/**
 * Get all profiles (with pagination)
 */
export async function getAllProfiles(limit: number = 50, offset: number = 0) {
  const results = await db
    .select()
    .from(profiles)
    .limit(limit)
    .offset(offset)
    .orderBy(profiles.createdAt);

  return results;
}

/**
 * Count total profiles
 */
export async function countProfiles() {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(profiles);

  return result?.count || 0;
}

/**
 * Check if user has a profile
 */
export async function userHasProfile(userId: string) {
  const profile = await getProfileByUserId(userId);
  return !!profile;
}

/**
 * Get profile with user details (using relation)
 */
export async function getProfileWithUser(id: string) {
  const result = await db.query.profiles.findFirst({
    where: eq(profiles.id, id),
    with: {
      user: true,
    },
  });

  return result || null;
}

/**
 * Get profiles by intent
 */
export async function getProfilesByIntent(
  intent: "dating" | "relationship" | "friends",
  limit: number = 50,
  offset: number = 0
) {
  const results = await db
    .select()
    .from(profiles)
    .where(eq(profiles.intent, intent))
    .limit(limit)
    .offset(offset)
    .orderBy(profiles.createdAt);

  return results;
}

/**
 * Get profiles by city
 */
export async function getProfilesByCity(
  city: string,
  limit: number = 50,
  offset: number = 0
) {
  const results = await db
    .select()
    .from(profiles)
    .where(ilike(profiles.city, `%${city}%`))
    .limit(limit)
    .offset(offset)
    .orderBy(profiles.createdAt);

  return results;
}

/**
 * Get profiles by age range
 */
export async function getProfilesByAgeRange(
  minAge: number,
  maxAge: number,
  limit: number = 50,
  offset: number = 0
) {
  const results = await db
    .select()
    .from(profiles)
    .where(and(gte(profiles.age, minAge), lte(profiles.age, maxAge)))
    .limit(limit)
    .offset(offset)
    .orderBy(profiles.createdAt);

  return results;
}
