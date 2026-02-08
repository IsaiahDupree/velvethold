import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createReview, getReviewByRequestId, getUserAverageRating } from "@/db/queries/reviews";
import { z } from "zod";

const createReviewSchema = z.object({
  requestId: z.string().uuid(),
  reviewedUserId: z.string().uuid(),
  rating: z.enum(["1", "2", "3", "4", "5"]),
  comment: z.string().max(500).optional(),
  atmosphere: z.enum(["1", "2", "3", "4", "5"]).optional(),
  conversation: z.enum(["1", "2", "3", "4", "5"]).optional(),
  timeliness: z.enum(["1", "2", "3", "4", "5"]).optional(),
  safetyRating: z.enum(["1", "2", "3", "4", "5"]).optional(),
  wouldMeetAgain: z.boolean().optional(),
  flagForSafety: z.boolean().optional(),
});

/**
 * POST /api/reviews - Submit a review for a completed date
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = createReviewSchema.parse(body);

    // Check if review already exists
    const existingReview = await getReviewByRequestId(data.requestId);
    if (existingReview) {
      return NextResponse.json(
        { error: "Review already submitted for this date" },
        { status: 409 }
      );
    }

    const review = await createReview({
      ...data,
      reviewerId: session.user.id,
    });

    // Get updated rating stats
    const stats = await getUserAverageRating(data.reviewedUserId);

    return NextResponse.json({
      success: true,
      review,
      userStats: stats,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[POST /api/reviews]", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reviews - Get reviews for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const stats = await getUserAverageRating(userId);

    return NextResponse.json({
      userId,
      ...stats,
    });
  } catch (error) {
    console.error("[GET /api/reviews]", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
