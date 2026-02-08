import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProfileByUserId, setInterestTagsForProfile } from "@/db/queries/profiles";
import { validateInterests, ALL_INTERESTS } from "@/lib/interests";
import { z } from "zod";

const updateInterestsSchema = z.object({
  interests: z.array(z.string()).min(0).max(20),
});

/**
 * GET /api/profiles/interests - Get all available interests and user's interests
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const profile = await getProfileByUserId(session.user.id);

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      userInterests: Array.isArray(profile.interestTags) ? profile.interestTags : [],
      availableInterests: ALL_INTERESTS,
      maxInterests: 20,
    });
  } catch (error) {
    console.error("[GET /api/profiles/interests]", error);
    return NextResponse.json(
      { error: "Failed to fetch interests" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profiles/interests - Update user's interest tags
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
    const { interests } = updateInterestsSchema.parse(body);

    // Validate all interests
    const validatedInterests = validateInterests(interests);

    const profile = await getProfileByUserId(session.user.id);

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const updatedProfile = await setInterestTagsForProfile(
      profile.id,
      validatedInterests
    );

    return NextResponse.json({
      success: true,
      interests: updatedProfile?.interestTags || [],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[POST /api/profiles/interests]", error);
    return NextResponse.json(
      { error: "Failed to update interests" },
      { status: 500 }
    );
  }
}
