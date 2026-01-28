import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  getProfileByUserId,
  updateProfileByUserId,
  deleteProfileByUserId,
} from "@/db/queries/profiles";
import { updateProfileSchema } from "@/lib/validations/profile";
import { moderateContent, isSpam } from "@/lib/content-moderation";
import { ZodError } from "zod";

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

    const profile = await updateProfileByUserId(user.id, validatedData);

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
