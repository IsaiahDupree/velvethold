import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  getRequestById,
  updateRequestStatus,
  userIsInvitee,
} from "@/db/queries/requests";
import { updateRequestStatusSchema } from "@/lib/validations/request";
import { ZodError } from "zod";

/**
 * GET /api/requests/[id]
 * Get a specific date request by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: requestId } = await params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dateRequest = await getRequestById(requestId);

    if (!dateRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // Verify user is involved in the request
    if (
      dateRequest.request.inviteeId !== user.id &&
      dateRequest.request.requesterId !== user.id
    ) {
      return NextResponse.json(
        { error: "You do not have access to this request" },
        { status: 403 }
      );
    }

    return NextResponse.json({ request: dateRequest });
  } catch (error) {
    console.error("Request retrieval error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/requests/[id]
 * Update a date request status (approve/decline)
 * Only the invitee can approve or decline
 */
export async function PATCH(
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
        { error: "Only the invitee can approve or decline a request" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateRequestStatusSchema.parse(body);

    if (!validatedData.approvalStatus) {
      return NextResponse.json(
        { error: "Approval status is required" },
        { status: 400 }
      );
    }

    const updatedRequest = await updateRequestStatus(
      requestId,
      validatedData.approvalStatus
    );

    if (!updatedRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Request ${validatedData.approvalStatus} successfully`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Request update error:", error);

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
