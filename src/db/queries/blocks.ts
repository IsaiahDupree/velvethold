import { db } from "@/db";
import { blocks, users, profiles } from "@/db/schema";
import { eq, and, or, desc } from "drizzle-orm";

export interface CreateBlockInput {
  blockerId: string;
  blockedUserId: string;
  reason?: string;
}

export async function createBlock(input: CreateBlockInput) {
  const { blockerId, blockedUserId, reason } = input;

  // Prevent self-blocking
  if (blockerId === blockedUserId) {
    throw new Error("You cannot block yourself");
  }

  // Check if block already exists
  const existingBlock = await db.query.blocks.findFirst({
    where: and(
      eq(blocks.blockerId, blockerId),
      eq(blocks.blockedUserId, blockedUserId)
    ),
  });

  if (existingBlock) {
    throw new Error("You have already blocked this user");
  }

  const [block] = await db
    .insert(blocks)
    .values({
      blockerId,
      blockedUserId,
      reason,
    })
    .returning();

  return block;
}

export async function removeBlock(blockerId: string, blockedUserId: string) {
  const [removedBlock] = await db
    .delete(blocks)
    .where(
      and(
        eq(blocks.blockerId, blockerId),
        eq(blocks.blockedUserId, blockedUserId)
      )
    )
    .returning();

  return removedBlock;
}

export async function isUserBlocked(blockerId: string, blockedUserId: string) {
  const block = await db.query.blocks.findFirst({
    where: and(
      eq(blocks.blockerId, blockerId),
      eq(blocks.blockedUserId, blockedUserId)
    ),
  });

  return !!block;
}

export async function isEitherUserBlocked(userId1: string, userId2: string) {
  const block = await db.query.blocks.findFirst({
    where: or(
      and(eq(blocks.blockerId, userId1), eq(blocks.blockedUserId, userId2)),
      and(eq(blocks.blockerId, userId2), eq(blocks.blockedUserId, userId1))
    ),
  });

  return !!block;
}

export async function getBlockedUsers(userId: string) {
  const blockedUsers = await db.query.blocks.findMany({
    where: eq(blocks.blockerId, userId),
    with: {
      blockedUser: {
        columns: {
          id: true,
          name: true,
        },
        with: {
          profile: {
            columns: {
              displayName: true,
              city: true,
            },
          },
        },
      },
    },
    orderBy: [desc(blocks.createdAt)],
  });

  return blockedUsers;
}

export async function getBlockedByUsers(userId: string) {
  const blockedByUsers = await db.query.blocks.findMany({
    where: eq(blocks.blockedUserId, userId),
    with: {
      blocker: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [desc(blocks.createdAt)],
  });

  return blockedByUsers;
}

export async function getBlockById(blockId: string) {
  const block = await db.query.blocks.findFirst({
    where: eq(blocks.id, blockId),
    with: {
      blocker: {
        columns: {
          id: true,
          name: true,
        },
      },
      blockedUser: {
        columns: {
          id: true,
          name: true,
        },
        with: {
          profile: {
            columns: {
              displayName: true,
            },
          },
        },
      },
    },
  });

  return block;
}
