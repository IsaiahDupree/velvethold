/**
 * Get current user's person ID
 *
 * Returns the canonical person ID for the authenticated user
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPersonIdFromUserId } from "@/lib/growth/identity-service";

export async function GET() {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get person ID
    const personId = await getPersonIdFromUserId(session.user.id);

    if (!personId) {
      return NextResponse.json(
        { error: "Person not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      personId,
      userId: session.user.id,
    });
  } catch (error) {
    console.error("Error fetching person ID:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
