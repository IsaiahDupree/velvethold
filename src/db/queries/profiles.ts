import { db } from "@/db";
import { profiles, blocks } from "@/db/schema";
import { eq, and, or, sql, ilike, gte, lte, notInArray } from "drizzle-orm";

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
  interestTags?: string[];
  prompts?: Record<string, any>[];
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
  interestTags?: string[];
  prompts?: Record<string, any>[];
}

export interface SearchProfilesInput {
  query?: string;
  intent?: "dating" | "relationship" | "friends";
  city?: string;
  minAge?: number;
  maxAge?: number;
  limit?: number;
  offset?: number;
  excludeUserId?: string; // Current user ID to exclude blocked users
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
      interestTags: input.interestTags ? JSON.stringify(input.interestTags) : null,
      prompts: input.prompts ? JSON.stringify(input.prompts) : null,
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
 * Search profiles with filters (excludes blocked users)
 */
export async function searchProfiles(input: SearchProfilesInput = {}) {
  const { query, intent, city, minAge, maxAge, limit = 50, offset = 0, excludeUserId } = input;

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

  // Exclude blocked users if current user ID is provided
  if (excludeUserId) {
    // Get all blocked user IDs (both directions)
    const blockedUsers = await db
      .select({ userId: blocks.blockedUserId })
      .from(blocks)
      .where(eq(blocks.blockerId, excludeUserId));

    const blockedByUsers = await db
      .select({ userId: blocks.blockerId })
      .from(blocks)
      .where(eq(blocks.blockedUserId, excludeUserId));

    const blockedUserIds = [
      ...blockedUsers.map((b) => b.userId),
      ...blockedByUsers.map((b) => b.userId),
    ];

    if (blockedUserIds.length > 0) {
      conditions.push(notInArray(profiles.userId, blockedUserIds));
    }

    // Also exclude own profile
    conditions.push(sql`${profiles.userId} != ${excludeUserId}`);
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

/**
 * Get profiles with matching interests
 */
export async function getProfilesByInterests(
  interests: string[],
  limit: number = 50,
  offset: number = 0
) {
  if (interests.length === 0) return [];

  const results = await db
    .select()
    .from(profiles)
    .where(sql`${profiles.interestTags} @> ${JSON.stringify(interests)}::jsonb`)
    .limit(limit)
    .offset(offset)
    .orderBy(profiles.createdAt);

  return results;
}

/**
 * Add interest tags to a profile
 */
export async function addInterestTagsToProfile(profileId: string, tags: string[]) {
  const profile = await getProfileById(profileId);
  if (!profile) return null;

  const currentTags = Array.isArray(profile.interestTags) ? profile.interestTags : [];
  const newTags = Array.from(new Set([...currentTags, ...tags])).slice(0, 20); // Max 20

  const [updated] = await db
    .update(profiles)
    .set({
      interestTags: JSON.stringify(newTags),
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, profileId))
    .returning();

  return updated;
}

/**
 * Remove interest tags from a profile
 */
export async function removeInterestTagsFromProfile(profileId: string, tags: string[]) {
  const profile = await getProfileById(profileId);
  if (!profile) return null;

  const currentTags = Array.isArray(profile.interestTags) ? profile.interestTags : [];
  const tagsToRemove = new Set(tags);
  const newTags = currentTags.filter(tag => !tagsToRemove.has(tag));

  const [updated] = await db
    .update(profiles)
    .set({
      interestTags: JSON.stringify(newTags),
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, profileId))
    .returning();

  return updated;
}

/**
 * Set interest tags for a profile (replaces all)
 */
export async function setInterestTagsForProfile(profileId: string, tags: string[]) {
  const validTags = tags.slice(0, 20); // Max 20

  const [updated] = await db
    .update(profiles)
    .set({
      interestTags: JSON.stringify(validTags),
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, profileId))
    .returning();

  return updated;
}

// ===========================
// PROFILE PROMPTS QUERIES
// ===========================

/**
 * Set profile prompts (answers to icebreaker questions)
 */
export async function setProfilePrompts(
  profileId: string,
  prompts: Record<string, any>[]
) {
  const validPrompts = prompts.slice(0, 5); // Max 5 prompts

  const [updated] = await db
    .update(profiles)
    .set({
      prompts: JSON.stringify(validPrompts),
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, profileId))
    .returning();

  return updated;
}

/**
 * Add a prompt answer to a profile
 */
export async function addPromptToProfile(
  profileId: string,
  promptId: string,
  answer: string
) {
  const profile = await getProfileById(profileId);
  if (!profile) return null;

  const currentPrompts = Array.isArray(profile.prompts) ? profile.prompts : [];

  // Check if prompt already exists
  const existingIndex = currentPrompts.findIndex(
    (p: any) => p.promptId === promptId
  );

  let newPrompts: Record<string, any>[];
  if (existingIndex >= 0) {
    // Update existing prompt
    newPrompts = [...currentPrompts];
    newPrompts[existingIndex] = {
      promptId,
      answer,
      answeredAt: new Date().toISOString(),
    };
  } else {
    // Add new prompt
    newPrompts = [
      ...currentPrompts,
      {
        promptId,
        answer,
        answeredAt: new Date().toISOString(),
      },
    ].slice(0, 5); // Max 5 prompts
  }

  return await setProfilePrompts(profileId, newPrompts);
}

/**
 * Remove a prompt answer from a profile
 */
export async function removePromptFromProfile(
  profileId: string,
  promptId: string
) {
  const profile = await getProfileById(profileId);
  if (!profile) return null;

  const currentPrompts = Array.isArray(profile.prompts) ? profile.prompts : [];
  const newPrompts = currentPrompts.filter(
    (p: any) => p.promptId !== promptId
  );

  return await setProfilePrompts(profileId, newPrompts);
}
