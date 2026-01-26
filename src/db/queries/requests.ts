import { db } from "@/db";
import { dateRequests, profiles, users } from "@/db/schema";
import { eq, and, or, desc } from "drizzle-orm";
import type { CreateRequestInput } from "@/lib/validations/request";

export async function createRequest(data: CreateRequestInput & { requesterId: string }) {
  const [request] = await db
    .insert(dateRequests)
    .values({
      inviteeId: data.inviteeId,
      requesterId: data.requesterId,
      slotId: data.slotId || null,
      screeningAnswers: data.screeningAnswers || null,
      introMessage: data.introMessage,
      depositAmount: data.depositAmount,
      depositStatus: "pending",
      approvalStatus: "pending",
    })
    .returning();

  return request;
}

export async function getRequestById(requestId: string) {
  const [request] = await db
    .select({
      request: dateRequests,
      inviteeProfile: profiles,
      inviteeUser: users,
    })
    .from(dateRequests)
    .leftJoin(users, eq(dateRequests.inviteeId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(dateRequests.id, requestId))
    .limit(1);

  return request;
}

export async function listUserRequests(userId: string, options: {
  asInvitee?: boolean;
  asRequester?: boolean;
  status?: "pending" | "approved" | "declined";
  limit?: number;
  offset?: number;
}) {
  const { asInvitee, asRequester, status, limit = 50, offset = 0 } = options;

  let query = db
    .select({
      request: dateRequests,
      inviteeProfile: profiles,
      inviteeUser: users,
    })
    .from(dateRequests)
    .leftJoin(users, eq(dateRequests.inviteeId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .orderBy(desc(dateRequests.createdAt))
    .limit(limit)
    .offset(offset);

  // Build where conditions
  const conditions = [];

  if (asInvitee && !asRequester) {
    conditions.push(eq(dateRequests.inviteeId, userId));
  } else if (asRequester && !asInvitee) {
    conditions.push(eq(dateRequests.requesterId, userId));
  } else {
    // Both or neither - return all requests involving the user
    conditions.push(
      or(
        eq(dateRequests.inviteeId, userId),
        eq(dateRequests.requesterId, userId)
      )
    );
  }

  if (status) {
    conditions.push(eq(dateRequests.approvalStatus, status));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const requests = await query;
  return requests;
}

export async function updateRequestStatus(
  requestId: string,
  status: "approved" | "declined"
) {
  const [request] = await db
    .update(dateRequests)
    .set({
      approvalStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(dateRequests.id, requestId))
    .returning();

  return request;
}

export async function userOwnsRequest(userId: string, requestId: string): Promise<boolean> {
  const [request] = await db
    .select()
    .from(dateRequests)
    .where(
      and(
        eq(dateRequests.id, requestId),
        or(
          eq(dateRequests.inviteeId, userId),
          eq(dateRequests.requesterId, userId)
        )
      )
    )
    .limit(1);

  return !!request;
}

export async function userIsInvitee(userId: string, requestId: string): Promise<boolean> {
  const [request] = await db
    .select()
    .from(dateRequests)
    .where(
      and(
        eq(dateRequests.id, requestId),
        eq(dateRequests.inviteeId, userId)
      )
    )
    .limit(1);

  return !!request;
}
