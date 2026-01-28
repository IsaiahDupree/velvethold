/**
 * Identity Sync API
 *
 * Syncs app users to the canonical person table
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { syncAppUserToPerson, identifyUser } from "@/lib/growth/identity-service";

/**
 * POST /api/growth/identity/sync
 * Sync current user to person table
 */
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { traits } = body;

    // Sync user to person table with optional traits
    const person = traits
      ? await identifyUser(session.user.id, traits)
      : await syncAppUserToPerson(session.user.id);

    return NextResponse.json({
      success: true,
      personId: person.id,
    });
  } catch (error) {
    console.error("Error syncing identity:", error);
    return NextResponse.json(
      { error: "Failed to sync identity" },
      { status: 500 }
    );
  }
}
