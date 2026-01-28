import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  getRequestById,
  updateRequestStatus,
  userIsInvitee,
  isRequestExpired,
} from "@/db/queries/requests";
import { processRefund } from "@/lib/stripe";
import { sendRequestDeclinedEmail } from "@/lib/email";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/requests/[id]/decline
 * Decline a date request
 * Only the invitee can decline a request
 * When declined, the deposit is refunded to the requester
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: requestId } = await params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is the invitee
    const isInvitee = await userIsInvitee(user.id, requestId);
    if (!isInvitee) {
      return NextResponse.json(
        { error: "Only the invitee can decline a request" },
        { status: 403 }
      );
    }

    // Get the current request to check its status
    const dateRequest = await getRequestById(requestId);
    if (!dateRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // Check if request is already approved or declined
    if (dateRequest.request.approvalStatus !== "pending") {
      return NextResponse.json(
        {
          error: `Request has already been ${dateRequest.request.approvalStatus}`,
        },
        { status: 400 }
      );
    }

    // Check if request has expired (allow decline even if expired for cleanup)
    if (isRequestExpired(dateRequest.request)) {
      // Still allow declining expired requests to process refunds
      console.log("Declining expired request:", requestId);
    }

    // Update the request status to declined
    const updatedRequest = await updateRequestStatus(requestId, "declined");

    // Process refund for the declined request
    // The deposit should be refunded to the requester
    let refundResult = null;
    try {
      refundResult = await processRefund(requestId);
    } catch (refundError) {
      console.error("Refund processing error:", refundError);
      // Don't fail the decline operation if refund fails
      // The refund can be processed manually later
    }

    // Send email notification to requester
    const [requester] = await db
      .select()
      .from(users)
      .where(eq(users.id, dateRequest.request.requesterId))
      .limit(1);

    if (requester) {
      await sendRequestDeclinedEmail(requester.email, requester.name, user.name);
    }

    return NextResponse.json({
      message: "Request declined successfully",
      request: updatedRequest,
      refund: refundResult,
    });
  } catch (error) {
    console.error("Request decline error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
