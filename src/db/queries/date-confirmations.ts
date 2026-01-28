import { db } from "@/db";
import { dateRequests } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function proposeDateDetails(
  requestId: string,
  proposerId: string,
  dateTime: Date,
  location: string,
  details?: string
) {
  const [request] = await db
    .select()
    .from(dateRequests)
    .where(eq(dateRequests.id, requestId))
    .limit(1);

  if (!request) {
    throw new Error("Request not found");
  }

  // Check if user is part of this request
  if (request.inviteeId !== proposerId && request.requesterId !== proposerId) {
    throw new Error("Unauthorized");
  }

  // Check if request is approved
  if (request.approvalStatus !== "approved") {
    throw new Error("Request must be approved before proposing date details");
  }

  // Reset confirmation flags when new details are proposed
  const [updatedRequest] = await db
    .update(dateRequests)
    .set({
      confirmedDateTime: dateTime,
      confirmedLocation: location,
      confirmedDetails: details || null,
      inviteeConfirmed: false,
      requesterConfirmed: false,
      updatedAt: new Date(),
    })
    .where(eq(dateRequests.id, requestId))
    .returning();

  return updatedRequest;
}

export async function confirmDateDetails(
  requestId: string,
  userId: string
) {
  const [request] = await db
    .select()
    .from(dateRequests)
    .where(eq(dateRequests.id, requestId))
    .limit(1);

  if (!request) {
    throw new Error("Request not found");
  }

  // Check if user is part of this request
  if (request.inviteeId !== userId && request.requesterId !== userId) {
    throw new Error("Unauthorized");
  }

  // Check if date details have been proposed
  if (!request.confirmedDateTime || !request.confirmedLocation) {
    throw new Error("No date details to confirm");
  }

  // Determine which user is confirming
  const isInvitee = request.inviteeId === userId;
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (isInvitee) {
    updateData.inviteeConfirmed = true;
  } else {
    updateData.requesterConfirmed = true;
  }

  // Check if both parties have now confirmed
  const bothConfirmed =
    (isInvitee && request.requesterConfirmed) ||
    (!isInvitee && request.inviteeConfirmed);

  if (bothConfirmed) {
    updateData.dateConfirmedAt = new Date();
  }

  const [updatedRequest] = await db
    .update(dateRequests)
    .set(updateData)
    .where(eq(dateRequests.id, requestId))
    .returning();

  return updatedRequest;
}

export async function getDateConfirmationStatus(requestId: string, userId: string) {
  const [request] = await db
    .select()
    .from(dateRequests)
    .where(eq(dateRequests.id, requestId))
    .limit(1);

  if (!request) {
    throw new Error("Request not found");
  }

  // Check if user is part of this request
  if (request.inviteeId !== userId && request.requesterId !== userId) {
    throw new Error("Unauthorized");
  }

  return {
    hasProposedDetails: !!(request.confirmedDateTime && request.confirmedLocation),
    inviteeConfirmed: request.inviteeConfirmed,
    requesterConfirmed: request.requesterConfirmed,
    bothConfirmed: request.inviteeConfirmed && request.requesterConfirmed,
    dateConfirmedAt: request.dateConfirmedAt,
    confirmedDateTime: request.confirmedDateTime,
    confirmedLocation: request.confirmedLocation,
    confirmedDetails: request.confirmedDetails,
  };
}
