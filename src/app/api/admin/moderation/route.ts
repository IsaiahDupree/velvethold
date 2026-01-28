import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { updateUserAccountStatus } from "@/db/queries/moderation";
import { updateUserStatusSchema } from "@/lib/validations/moderation";
import { ZodError } from "zod";

/**
 * PATCH /api/admin/moderation
 * Update user account status (admin only)
 *
 * Note: In production, this would check for admin/moderator role.
 * For now, any authenticated user can use this endpoint.
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: In production, add admin/moderator role check
    // Example: if (!user.isAdmin && !user.isModerator) { return 403 }

    const body = await request.json();

    // Validate input
    const validatedData = updateUserStatusSchema.parse(body);

    // Prevent users from modifying their own status
    if (validatedData.userId === user.id) {
      return NextResponse.json(
        { error: "Cannot modify your own account status" },
        { status: 400 }
      );
    }

    // Update user status
    const updatedUser = await updateUserAccountStatus(
      validatedData.userId,
      validatedData.accountStatus
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "User account status updated successfully",
      user: {
        id: updatedUser.id,
        accountStatus: updatedUser.accountStatus,
      },
      reason: validatedData.reason,
    });
  } catch (error) {
    console.error("Moderation error:", error);

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
