import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  getRequestById,
  updateRequestStatus,
  userIsInvitee,
  isRequestExpired,
} from "@/db/queries/requests";
import { db } from "@/db";
import { chats } from "@/db/schema";

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
