import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  searchProfiles,
  createProfile,
  userHasProfile,
} from "@/db/queries/profiles";

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
    const query = searchParams.get("query") || undefined;
    const intent = searchParams.get("intent") as
      | "dating"
      | "relationship"
      | "friends"
      | undefined;
    const city = searchParams.get("city") || undefined;
    const minAge = searchParams.get("minAge")
      ? parseInt(searchParams.get("minAge")!)
      : undefined;
    const maxAge = searchParams.get("maxAge")
      ? parseInt(searchParams.get("maxAge")!)
      : undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 50;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!)
      : 0;

    const profiles = await searchProfiles({
      query,
      intent,
      city,
      minAge,
      maxAge,
      limit,
      offset,
    });

    return NextResponse.json({ profiles, count: profiles.length });
  } catch (error) {
    console.error("Profile search error:", error);
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
    const { displayName, age, city, bio, intent, datePreferences, boundaries, screeningQuestions, depositAmount, cancellationPolicy, availabilityVisibility } = body;

    // Validate required fields
    if (!displayName || !age || !city) {
      return NextResponse.json(
        { error: "Missing required fields: displayName, age, city" },
        { status: 400 }
      );
    }

    // Validate age
    if (age < 18 || age > 120) {
      return NextResponse.json(
        { error: "Invalid age. Must be between 18 and 120" },
        { status: 400 }
      );
    }

    // Validate intent if provided
    if (intent && !["dating", "relationship", "friends"].includes(intent)) {
      return NextResponse.json(
        { error: "Invalid intent. Must be one of: dating, relationship, friends" },
        { status: 400 }
      );
    }

    const profile = await createProfile({
      userId: user.id,
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

    return NextResponse.json(
      { message: "Profile created successfully", profile },
      { status: 201 }
    );
  } catch (error) {
    console.error("Profile creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
