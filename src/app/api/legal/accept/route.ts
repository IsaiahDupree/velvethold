import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { trackEvent } from "@/db/queries/growth-data-plane";
import { z } from "zod";

const acceptLegalSchema = z.object({
  tos: z.boolean().optional(),
  privacy: z.boolean().optional(),
  tosVersion: z.string().optional(),
  privacyVersion: z.string().optional(),
});

/**
 * POST /api/legal/accept
 * Accept Terms of Service and/or Privacy Policy
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tos, privacy, tosVersion = "1.0", privacyVersion = "1.0" } =
      acceptLegalSchema.parse(body);

    if (!tos && !privacy) {
      return NextResponse.json(
        { error: "Must accept at least one legal document" },
        { status: 400 }
      );
    }

    const now = new Date();
    const updateData: any = {
      updatedAt: now,
    };

    if (tos) {
      updateData.tosAcceptedAt = now;
      updateData.tosVersion = tosVersion;
    }

    if (privacy) {
      updateData.privacyAcceptedAt = now;
      updateData.privacyVersion = privacyVersion;
    }

    // Update user record
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning();

    // Track acceptance event
    try {
      await trackEvent({
        eventName: "legal_documents_accepted",
        source: "web",
        properties: {
          tos: tos || false,
          privacy: privacy || false,
          tosVersion,
          privacyVersion,
        },
      });
    } catch (trackError) {
      console.warn("Failed to track legal acceptance event:", trackError);
    }

    return NextResponse.json({
      success: true,
      message: "Legal documents accepted successfully",
      tosAcceptedAt: updatedUser.tosAcceptedAt,
      privacyAcceptedAt: updatedUser.privacyAcceptedAt,
    });
  } catch (error: any) {
    console.error("Legal acceptance error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/legal/accept
 * Check acceptance status of legal documents
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [userData] = await db
      .select({
        tosAcceptedAt: users.tosAcceptedAt,
        tosVersion: users.tosVersion,
        privacyAcceptedAt: users.privacyAcceptedAt,
        privacyVersion: users.privacyVersion,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      tosAccepted: !!userData.tosAcceptedAt,
      tosVersion: userData.tosVersion,
      tosAcceptedAt: userData.tosAcceptedAt,
      privacyAccepted: !!userData.privacyAcceptedAt,
      privacyVersion: userData.privacyVersion,
      privacyAcceptedAt: userData.privacyAcceptedAt,
    });
  } catch (error) {
    console.error("Legal status check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
