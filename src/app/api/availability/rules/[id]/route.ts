import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAvailabilityRuleById,
  updateAvailabilityRule,
  deleteAvailabilityRule,
} from "@/db/queries/availability";
import { getProfileByUserId } from "@/db/queries/profiles";
import { updateAvailabilityRuleSchema } from "@/lib/validations/availability";

/**
 * GET /api/availability/rules/[id]
 * Get a specific availability rule
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const rule = await getAvailabilityRuleById(id);

    if (!rule) {
      return NextResponse.json(
        { error: "Availability rule not found" },
        { status: 404 }
      );
    }

    // Verify the rule belongs to the authenticated user's profile
    const profile = await getProfileByUserId(session.user.id);
    if (!profile || profile.id !== rule.profileId) {
      return NextResponse.json(
        { error: "You can only view your own availability rules" },
        { status: 403 }
      );
    }

    return NextResponse.json(rule);
  } catch (error) {
    console.error("Error fetching availability rule:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability rule" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/availability/rules/[id]
 * Update an availability rule
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const rule = await getAvailabilityRuleById(id);

    if (!rule) {
      return NextResponse.json(
        { error: "Availability rule not found" },
        { status: 404 }
      );
    }

    // Verify the rule belongs to the authenticated user's profile
    const profile = await getProfileByUserId(session.user.id);
    if (!profile || profile.id !== rule.profileId) {
      return NextResponse.json(
        { error: "You can only update your own availability rules" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = updateAvailabilityRuleSchema.parse(body);

    const updated = await updateAvailabilityRule(id, validated);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating availability rule:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update availability rule" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/availability/rules/[id]
 * Delete a specific availability rule
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const rule = await getAvailabilityRuleById(id);

    if (!rule) {
      return NextResponse.json(
        { error: "Availability rule not found" },
        { status: 404 }
      );
    }

    // Verify the rule belongs to the authenticated user's profile
    const profile = await getProfileByUserId(session.user.id);
    if (!profile || profile.id !== rule.profileId) {
      return NextResponse.json(
        { error: "You can only delete your own availability rules" },
        { status: 403 }
      );
    }

    await deleteAvailabilityRule(id);

    return NextResponse.json({
      message: "Availability rule deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting availability rule:", error);
    return NextResponse.json(
      { error: "Failed to delete availability rule" },
      { status: 500 }
    );
  }
}
