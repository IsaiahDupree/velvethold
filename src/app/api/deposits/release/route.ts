import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { releaseDepositOnCompletion } from "@/lib/stripe";
import { db } from "@/db";
import { dateRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { trackEvent } from "@/db/queries/growth-data-plane";
import { z } from "zod";

const releaseDepositSchema = z.object({
  requestId: z.string().uuid("Invalid request ID"),
});

/**
 * POST /api/deposits/release
 * Manually request to release a deposit after a confirmed date
 *
 * This endpoint allows either party to manually trigger deposit release if:
 * - Both parties have confirmed the date details
 * - The deposit is still in "held" status
 * - The request is approved
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { requestId } = releaseDepositSchema.parse(body);

    // Verify the request exists
    const [dateRequest] = await db
      .select()
      .from(dateRequests)
      .where(eq(dateRequests.id, requestId))
      .limit(1);

    if (!dateRequest) {
      return NextResponse.json(
        { error: "Date request not found" },
        { status: 404 }
      );
    }

    // Verify user is involved in the request (either invitee or requester)
    if (dateRequest.inviteeId !== user.id && dateRequest.requesterId !== user.id) {
      return NextResponse.json(
        { error: "You are not authorized to release this deposit" },
        { status: 403 }
      );
    }

    // Verify request is approved
    if (dateRequest.approvalStatus !== "approved") {
      return NextResponse.json(
        { error: "Request must be approved to release deposit" },
        { status: 400 }
      );
    }

    // Verify both parties have confirmed
    if (!dateRequest.inviteeConfirmed || !dateRequest.requesterConfirmed) {
      return NextResponse.json(
        { error: "Both parties must confirm the date before releasing deposit" },
        { status: 400 }
      );
    }

    // Check if deposit is in a refundable state
    if (dateRequest.depositStatus === "refunded") {
      return NextResponse.json(
        { error: "Deposit has already been refunded" },
        { status: 400 }
      );
    }

    if (dateRequest.depositStatus === "released") {
      return NextResponse.json(
        { error: "Deposit has already been released" },
        { status: 400 }
      );
    }

    if (dateRequest.depositStatus === "pending") {
      return NextResponse.json(
        { error: "Payment is still pending" },
        { status: 400 }
      );
    }

    // Release the deposit
    const result = await releaseDepositOnCompletion(requestId);

    // Track deposit release event
    try {
      await trackEvent({
        eventName: "deposit_refunded_on_completion",
        source: "web",
        properties: {
          requestId: requestId,
          inviteeId: dateRequest.inviteeId,
          amount: dateRequest.depositAmount,
          reason: "date_completed",
          manualRelease: true,
          releasedBy: user.id,
        },
      });
    } catch (trackError) {
      console.warn("Failed to track deposit release event:", trackError);
    }

    return NextResponse.json({
      success: true,
      message: "Deposit released successfully",
      refundId: result.refundId,
      amount: result.amount,
      status: result.status,
    });
  } catch (error: any) {
    console.error("Deposit release error:", error);

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
