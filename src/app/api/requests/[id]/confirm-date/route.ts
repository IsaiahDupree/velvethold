import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { confirmDateDetails } from "@/db/queries/date-confirmations";
import { trackEvent } from "@/db/queries/growth-data-plane";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id: requestId } = await params;

    const updatedRequest = await confirmDateDetails(
      requestId,
      session.user.id
    );

    // Track date confirmation event
    try {
      await trackEvent({
        eventName: "date_confirmed",
        source: "web",
        properties: {
          requestId: requestId,
          bothConfirmed: updatedRequest.inviteeConfirmed && updatedRequest.requesterConfirmed,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (trackError) {
      console.warn("Failed to track date confirmation event:", trackError);
    }

    // If both parties have confirmed, let them know deposit refund is pending
    const depositReleasePending =
      updatedRequest.inviteeConfirmed &&
      updatedRequest.requesterConfirmed &&
      updatedRequest.depositStatus === "held";

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      depositReleasePending,
      message: depositReleasePending
        ? "Great! Both parties confirmed. Your deposit will be automatically refunded within the next 30 minutes."
        : undefined,
    });
  } catch (error: any) {
    console.error("Error confirming date details:", error);
    return NextResponse.json(
      { error: error.message || "Failed to confirm date details" },
      { status: 400 }
    );
  }
}
