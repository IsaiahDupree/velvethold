import { db } from "@/db";
import { chats, messages, dateRequests, profiles, users } from "@/db/schema";
import { eq, desc, and, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

/**
 * Get all chats for a user
 * Returns chats with the most recent message and other participant info
 */
export async function getUserChats(userId: string) {
  const inviteeUser = alias(users, "invitee_user");
  const requesterUser = alias(users, "requester_user");
  const inviteeProfile = alias(profiles, "invitee_profile");
  const requesterProfile = alias(profiles, "requester_profile");

  // Get all chats where the user is either the invitee or requester
  const userChats = await db
    .select({
      chat: chats,
      request: dateRequests,
      inviteeUser: inviteeUser,
      inviteeProfile: inviteeProfile,
      requesterUser: requesterUser,
      requesterProfile: requesterProfile,
    })
    .from(chats)
    .innerJoin(dateRequests, eq(chats.requestId, dateRequests.id))
    .leftJoin(inviteeUser, eq(dateRequests.inviteeId, inviteeUser.id))
    .leftJoin(inviteeProfile, eq(inviteeUser.id, inviteeProfile.userId))
    .leftJoin(requesterUser, eq(dateRequests.requesterId, requesterUser.id))
    .leftJoin(requesterProfile, eq(requesterUser.id, requesterProfile.userId))
    .where(
      or(
        eq(dateRequests.inviteeId, userId),
        eq(dateRequests.requesterId, userId)
      )
    )
    .orderBy(desc(chats.createdAt));

  // For each chat, get the most recent message
  const chatsWithMessages = await Promise.all(
    userChats.map(async (chatData) => {
      const [lastMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.chatId, chatData.chat.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      return {
        ...chatData,
        lastMessage: lastMessage || null,
      };
    })
  );

  return chatsWithMessages;
}

/**
 * Get a specific chat by ID with all messages
 */
export async function getChatById(chatId: string, userId: string) {
  const inviteeUser = alias(users, "invitee_user");
  const requesterUser = alias(users, "requester_user");
  const inviteeProfile = alias(profiles, "invitee_profile");
  const requesterProfile = alias(profiles, "requester_profile");

  // Get the chat with participant info
  const [chat] = await db
    .select({
      chat: chats,
      request: dateRequests,
      inviteeUser: inviteeUser,
      inviteeProfile: inviteeProfile,
      requesterUser: requesterUser,
      requesterProfile: requesterProfile,
    })
    .from(chats)
    .innerJoin(dateRequests, eq(chats.requestId, dateRequests.id))
    .leftJoin(inviteeUser, eq(dateRequests.inviteeId, inviteeUser.id))
    .leftJoin(inviteeProfile, eq(inviteeUser.id, inviteeProfile.userId))
    .leftJoin(requesterUser, eq(dateRequests.requesterId, requesterUser.id))
    .leftJoin(requesterProfile, eq(requesterUser.id, requesterProfile.userId))
    .where(
      and(
        eq(chats.id, chatId),
        or(
          eq(dateRequests.inviteeId, userId),
          eq(dateRequests.requesterId, userId)
        )
      )
    )
    .limit(1);

  if (!chat) {
    return null;
  }

  // Get all messages for this chat
  const chatMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(messages.createdAt);

  return {
    ...chat,
    messages: chatMessages,
  };
}

/**
 * Create a message in a chat
 */
export async function createMessage(
  chatId: string,
  senderId: string,
  content: string
) {
  const [message] = await db
    .insert(messages)
    .values({
      chatId,
      senderId,
      content,
    })
    .returning();

  return message;
}

/**
 * Check if a user is a participant in a chat
 */
export async function userIsParticipant(
  userId: string,
  chatId: string
): Promise<boolean> {
  const [chat] = await db
    .select()
    .from(chats)
    .innerJoin(dateRequests, eq(chats.requestId, dateRequests.id))
    .where(
      and(
        eq(chats.id, chatId),
        or(
          eq(dateRequests.inviteeId, userId),
          eq(dateRequests.requesterId, userId)
        )
      )
    )
    .limit(1);

  return !!chat;
}
