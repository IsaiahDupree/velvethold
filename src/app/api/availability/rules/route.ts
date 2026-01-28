import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createAvailabilityRule,
  createAvailabilityRules,
  getAvailabilityRulesByProfileId,
  deleteAvailabilityRulesByProfileId,
} from "@/db/queries/availability";
import { getProfileByUserId } from "@/db/queries/profiles";
import {
  createAvailabilityRuleSchema,
  createAvailabilityRulesSchema,
} from "@/lib/validations/availability";

/**
 * GET /api/availability/rules?profileId=xxx
 * Get all availability rules for a profile
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId is required" },
        { status: 400 }
      );
    }

    // Verify the profile belongs to the authenticated user
    const profile = await getProfileByUserId(session.user.id);
    if (!profile || profile.id !== profileId) {
      return NextResponse.json(
        { error: "You can only view your own availability rules" },
        { status: 403 }
      );
    }

    const rules = await getAvailabilityRulesByProfileId(profileId);
    return NextResponse.json(rules);
  } catch (error) {
    console.error("Error fetching availability rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability rules" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/availability/rules
 * Create one or multiple availability rules
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Check if creating multiple rules or a single rule
    const isMultiple = Array.isArray(body.rules);

    if (isMultiple) {
      // Validate multiple rules
      const validated = createAvailabilityRulesSchema.parse(body);

      // Verify the profile belongs to the authenticated user
      const profile = await getProfileByUserId(session.user.id);
      if (!profile || profile.id !== validated.profileId) {
        return NextResponse.json(
          { error: "You can only create availability rules for your own profile" },
          { status: 403 }
        );
      }

      // Create multiple rules
      const rules = await createAvailabilityRules(
        validated.rules.map(rule => ({
          ...rule,
          profileId: validated.profileId,
        }))
      );

      return NextResponse.json(rules, { status: 201 });
    } else {
      // Validate single rule
      const validated = createAvailabilityRuleSchema.parse(body);

      // Verify the profile belongs to the authenticated user
      const profile = await getProfileByUserId(session.user.id);
      if (!profile || profile.id !== validated.profileId) {
        return NextResponse.json(
          { error: "You can only create availability rules for your own profile" },
          { status: 403 }
        );
      }

      // Create single rule
      const rule = await createAvailabilityRule(validated);
      return NextResponse.json(rule, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating availability rule:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create availability rule" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/availability/rules?profileId=xxx
 * Delete all availability rules for a profile
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId is required" },
        { status: 400 }
      );
    }

    // Verify the profile belongs to the authenticated user
    const profile = await getProfileByUserId(session.user.id);
    if (!profile || profile.id !== profileId) {
      return NextResponse.json(
        { error: "You can only delete your own availability rules" },
        { status: 403 }
      );
    }

    const deleted = await deleteAvailabilityRulesByProfileId(profileId);
    return NextResponse.json({
      message: "Availability rules deleted successfully",
      count: deleted.length
    });
  } catch (error) {
    console.error("Error deleting availability rules:", error);
    return NextResponse.json(
      { error: "Failed to delete availability rules" },
      { status: 500 }
    );
  }
}
