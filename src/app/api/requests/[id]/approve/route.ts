import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  getRequestById,
  updateRequestStatus,
  userIsInvitee,
  isRequestExpired,
} from "@/db/queries/requests";
import { sendRequestApprovedEmail } from "@/lib/email";
import { db } from "@/db";
import { chats, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { trackAppEvent } from "@/lib/growth/event-service";

/**
 * POST /api/requests/[id]/approve
 * Approve a date request
 * Only the invitee can approve a request
 * When approved, a chat is created for the two users
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
        { error: "Only the invitee can approve a request" },
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

    // Check if request has expired
    if (isRequestExpired(dateRequest.request)) {
      return NextResponse.json(
        {
          error: "Request has expired and can no longer be approved",
        },
        { status: 400 }
      );
    }

    // Update the request status to approved
    const updatedRequest = await updateRequestStatus(requestId, "approved");

    // Create a chat for the approved request
    const [chat] = await db
      .insert(chats)
      .values({
        requestId: requestId,
      })
      .returning();

    // Send email notification to requester
    const [requester] = await db
      .select()
      .from(users)
      .where(eq(users.id, dateRequest.request.requesterId))
      .limit(1);

    if (requester) {
      await sendRequestApprovedEmail(
        requester.email,
        requester.name,
        user.name || "Unknown"
      );
    }

    // Track request_approved event
    await trackAppEvent({
      eventName: "request_approved",
      userId: user.id,
      properties: {
        requestId: requestId,
        requesterId: dateRequest.request.requesterId,
        chatId: chat.id,
        depositAmount: dateRequest.request.depositAmount,
      },
    }).catch((error) => {
      console.error("Failed to track request_approved event:", error);
      // Don't fail approval if tracking fails
    });

    return NextResponse.json({
      message: "Request approved successfully",
      request: updatedRequest,
      chat: chat,
    });
  } catch (error) {
    console.error("Request approval error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
