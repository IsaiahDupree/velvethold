import { db } from "@/db";
import { reviews, dateRequests, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export interface CreateReviewInput {
  requestId: string;
  reviewerId: string;
  reviewedUserId: string;
  rating: "1" | "2" | "3" | "4" | "5";
  comment?: string;
  atmosphere?: "1" | "2" | "3" | "4" | "5";
  conversation?: "1" | "2" | "3" | "4" | "5";
  timeliness?: "1" | "2" | "3" | "4" | "5";
  safetyRating?: "1" | "2" | "3" | "4" | "5";
  wouldMeetAgain?: boolean;
  flagForSafety?: boolean;
}

/**
 * Create a review for a completed date
 */
export async function createReview(input: CreateReviewInput) {
  const [review] = await db
    .insert(reviews)
    .values({
      requestId: input.requestId,
      reviewerId: input.reviewerId,
      reviewedUserId: input.reviewedUserId,
      rating: input.rating,
      comment: input.comment,
      atmosphere: input.atmosphere,
      conversation: input.conversation,
      timeliness: input.timeliness,
      safetyRating: input.safetyRating,
      wouldMeetAgain: input.wouldMeetAgain ?? true,
      flagForSafety: input.flagForSafety ?? false,
    })
    .returning();

  return review;
}

/**
 * Get review by request ID
 */
export async function getReviewByRequestId(requestId: string) {
  const [review] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.requestId, requestId));

  return review || null;
}

/**
 * Get reviews for a user (received reviews)
 */
export async function getReviewsForUser(userId: string) {
  return await db
    .select()
    .from(reviews)
    .where(eq(reviews.reviewedUserId, userId))
    .orderBy(reviews.createdAt);
}

/**
 * Get average rating for a user
 */
export async function getUserAverageRating(userId: string) {
  const [result] = await db
    .select({
      avgRating: sql<number>`AVG(CAST(${reviews.rating} AS INTEGER))::NUMERIC`,
      totalReviews: sql<number>`COUNT(*)::INT`,
    })
    .from(reviews)
    .where(eq(reviews.reviewedUserId, userId));

  return {
    averageRating: result?.avgRating
      ? Math.round((parseFloat(String(result.avgRating)) * 10) / 10)
      : 0,
    totalReviews: result?.totalReviews || 0,
  };
}

/**
 * Get reviews written by a user
 */
export async function getReviewsByReviewer(userId: string) {
  return await db
    .select()
    .from(reviews)
    .where(eq(reviews.reviewerId, userId))
    .orderBy(reviews.createdAt);
}

/**
 * Check if review exists for a date request
 */
export async function reviewExists(requestId: string) {
  const [review] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.requestId, requestId))
    .limit(1);

  return !!review;
}

/**
 * Get safety flags for moderation
 */
export async function getSafetyFlaggedReviews() {
  return await db
    .select()
    .from(reviews)
    .where(eq(reviews.flagForSafety, true))
    .orderBy(reviews.createdAt);
}

/**
 * Count positive experiences (would meet again)
 */
export async function getWouldMeetAgainCount(userId: string) {
  const [result] = await db
    .select({
      count: sql<number>`COUNT(*)::INT`,
    })
    .from(reviews)
    .where(
      and(
        eq(reviews.reviewedUserId, userId),
        eq(reviews.wouldMeetAgain, true)
      )
    );

  return result?.count || 0;
}
