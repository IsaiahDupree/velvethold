import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  getProfileByUserId,
  updateProfileByUserId,
  deleteProfileByUserId,
} from "@/db/queries/profiles";

/**
 * GET /api/profiles/me
 * Get the current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfileByUserId(user.id);
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profiles/me
 * Update the current user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      displayName,
      age,
      city,
      bio,
      intent,
      datePreferences,
      boundaries,
      screeningQuestions,
      depositAmount,
      cancellationPolicy,
      availabilityVisibility,
    } = body;

    // Validate age if provided
    if (age !== undefined && (age < 18 || age > 120)) {
      return NextResponse.json(
        { error: "Invalid age. Must be between 18 and 120" },
        { status: 400 }
      );
    }

    // Validate intent if provided
    if (intent && !["dating", "relationship", "friends"].includes(intent)) {
      return NextResponse.json(
        {
          error:
            "Invalid intent. Must be one of: dating, relationship, friends",
        },
        { status: 400 }
      );
    }

    const profile = await updateProfileByUserId(user.id, {
      displayName,
      age,
      city,
      bio,
      intent,
      datePreferences,
      boundaries,
      screeningQuestions,
      depositAmount,
      cancellationPolicy,
      availabilityVisibility,
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profiles/me
 * Delete the current user's profile
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await deleteProfileByUserId(user.id);
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Profile deleted successfully",
      profile,
    });
  } catch (error) {
    console.error("Profile deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
