import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  searchProfiles,
  createProfile,
  userHasProfile,
} from "@/db/queries/profiles";
import {
  searchProfilesSchema,
  createProfileSchema,
} from "@/lib/validations/profile";
import { moderateContent, isSpam } from "@/lib/content-moderation";
import { ZodError } from "zod";

/**
 * GET /api/profiles
 * Search/list profiles with optional filters
 * Query params: query, intent, city, minAge, maxAge, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    // Parse and validate search parameters
    const searchInput = {
      query: searchParams.get("query") || undefined,
      intent: searchParams.get("intent") || undefined,
      city: searchParams.get("city") || undefined,
      minAge: searchParams.get("minAge")
        ? parseInt(searchParams.get("minAge")!)
        : undefined,
      maxAge: searchParams.get("maxAge")
        ? parseInt(searchParams.get("maxAge")!)
        : undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 50,
      offset: searchParams.get("offset")
        ? parseInt(searchParams.get("offset")!)
        : 0,
      excludeUserId: user.id, // Exclude blocked users
    };

    const validatedSearch = searchProfilesSchema.parse(searchInput);
    const profiles = await searchProfiles(validatedSearch);

    return NextResponse.json({ profiles, count: profiles.length });
  } catch (error) {
    console.error("Profile search error:", error);

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
 * POST /api/profiles
 * Create a new profile for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a profile
    const hasProfile = await userHasProfile(user.id);
    if (hasProfile) {
      return NextResponse.json(
        { error: "User already has a profile" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input with Zod
    const validatedData = createProfileSchema.parse(body);

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

    const profile = await createProfile({
      userId: user.id,
      ...validatedData,
    });

    return NextResponse.json(
      { message: "Profile created successfully", profile },
      { status: 201 }
    );
  } catch (error) {
    console.error("Profile creation error:", error);

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
