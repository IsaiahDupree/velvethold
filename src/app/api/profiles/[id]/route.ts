import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  getProfileById,
  updateProfile,
  deleteProfile,
} from "@/db/queries/profiles";

/**
 * GET /api/profiles/[id]
 * Get a profile by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const profile = await getProfileById(id);
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
 * PATCH /api/profiles/[id]
 * Update a profile by ID
 * Only the profile owner can update their profile
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if profile exists and belongs to the user
    const existingProfile = await getProfileById(id);
    if (!existingProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    if (existingProfile.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only update your own profile" },
        { status: 403 }
      );
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

    const profile = await updateProfile(id, {
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
 * DELETE /api/profiles/[id]
 * Delete a profile by ID
 * Only the profile owner can delete their profile
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if profile exists and belongs to the user
    const existingProfile = await getProfileById(id);
    if (!existingProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    if (existingProfile.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own profile" },
        { status: 403 }
      );
    }

    const profile = await deleteProfile(id);

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
