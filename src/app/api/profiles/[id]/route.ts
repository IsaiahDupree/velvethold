import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  getProfileById,
  updateProfile,
  deleteProfile,
} from "@/db/queries/profiles";
import { updateProfileSchema, profileIdSchema } from "@/lib/validations/profile";
import { moderateContent, isSpam } from "@/lib/content-moderation";
import { ZodError } from "zod";

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

    // Validate ID format
    profileIdSchema.parse({ id });

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

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

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

    // Validate ID format
    profileIdSchema.parse({ id });

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

    // Validate input with Zod
    const validatedData = updateProfileSchema.parse(body);

    // Moderate bio content if provided
    if (validatedData.bio) {
      // Check for spam
      if (isSpam(validatedData.bio)) {
        return NextResponse.json(
          { error: "Bio content appears to be spam" },
          { status: 400 }
        );
      }

      // Moderate content
      const moderation = moderateContent(validatedData.bio);
      if (!moderation.allowed) {
        return NextResponse.json(
          { error: moderation.reason || "Bio contains prohibited content" },
          { status: 400 }
        );
      }
    }

    const profile = await updateProfile(id, validatedData);

    return NextResponse.json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Profile update error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

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

    // Validate ID format
    profileIdSchema.parse({ id });

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

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
