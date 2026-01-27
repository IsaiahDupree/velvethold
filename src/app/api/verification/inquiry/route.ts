import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { createVerificationInquiry } from "@/lib/integrations/persona";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/verification/inquiry
 * Create a new Persona verification inquiry for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is already verified
    if (user.verificationStatus === "verified") {
      return NextResponse.json(
        { error: "User is already verified" },
        { status: 400 }
      );
    }

    // Create a new inquiry with Persona
    const inquiry = await createVerificationInquiry(user.id, user.id);

    // Update user verification status to pending
    await db
      .update(users)
      .set({
        verificationStatus: "pending",
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json(
      {
        message: "Verification inquiry created successfully",
        inquiry: {
          id: inquiry.data?.id,
          sessionToken: inquiry.data?.attributes?.["session-token"],
          status: inquiry.data?.attributes?.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Verification inquiry creation error:", error);

    return NextResponse.json(
      { error: "Failed to create verification inquiry" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/verification/inquiry
 * Get the current user's verification status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      verificationStatus: user.verificationStatus,
    });
  } catch (error) {
    console.error("Verification status retrieval error:", error);

    return NextResponse.json(
      { error: "Failed to retrieve verification status" },
      { status: 500 }
    );
  }
}
