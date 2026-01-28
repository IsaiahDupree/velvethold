import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { createMessage, userIsParticipant } from "@/db/queries/chats";
import { db } from "@/db";
import { messages, chats, dateRequests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { pusherServer, getChatChannel, PUSHER_EVENTS } from "@/lib/pusher";
import { moderateContent, isSpam, checkRateLimit } from "@/lib/content-moderation";
import { isEitherUserBlocked } from "@/db/queries/blocks";
import { trackAppEvent } from "@/lib/growth/event-service";

const messageSchema = z.object({
  content: z.string().min(1).max(5000),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await requireAuth();
    const { chatId } = await params;

    // Verify user is a participant in this chat
    const isParticipant = await userIsParticipant(session.user.id, chatId);

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Not authorized to view messages in this chat" },
        { status: 403 }
      );
    }

    // Get query parameters for pagination
    const searchParams = req.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch messages with pagination
    const chatMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    // Reverse to get chronological order (oldest first)
    chatMessages.reverse();

    return NextResponse.json(
      {
        messages: chatMessages,
        limit,
        offset,
        hasMore: chatMessages.length === limit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await requireAuth();
    const { chatId } = await params;

    // Verify user is a participant in this chat
    const isParticipant = await userIsParticipant(session.user.id, chatId);

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Not authorized to send messages in this chat" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = messageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid message content", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // Rate limiting check
    if (!checkRateLimit(session.user.id, 10)) {
      return NextResponse.json(
        { error: "You are sending messages too quickly. Please wait a moment." },
        { status: 429 }
      );
    }

    // Spam detection
    if (isSpam(content)) {
      return NextResponse.json(
        { error: "Message appears to be spam. Please send a normal message." },
        { status: 400 }
      );
    }

    // Content moderation
    const moderation = moderateContent(content);
    if (!moderation.allowed) {
      return NextResponse.json(
        { error: moderation.reason || "Message contains prohibited content" },
        { status: 400 }
      );
    }

    // Check if users have blocked each other
    // Get the chat to find the other user
    const [chat] = await db
      .select()
      .from(chats)
      .where(eq(chats.id, chatId))
      .limit(1);

    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    const [request] = await db
      .select()
      .from(dateRequests)
      .where(eq(dateRequests.id, chat.requestId))
      .limit(1);

    if (request) {
      const otherUserId = request.inviteeId === session.user.id
        ? request.requesterId
        : request.inviteeId;

      const isBlocked = await isEitherUserBlocked(session.user.id, otherUserId);
      if (isBlocked) {
        return NextResponse.json(
          { error: "Cannot send message. Communication with this user is blocked." },
          { status: 403 }
        );
      }
    }

    // Create the message
    const message = await createMessage(chatId, session.user.id, content);

    // Broadcast the message to all chat participants via Pusher
    try {
      await pusherServer.trigger(
        getChatChannel(chatId),
        PUSHER_EVENTS.NEW_MESSAGE,
        message
      );
    } catch (pusherError) {
      console.error("Error broadcasting message via Pusher:", pusherError);
      // Don't fail the request if Pusher fails - message is still saved
    }

    // Track message_sent event
    await trackAppEvent({
      eventName: "message_sent",
      userId: session.user.id,
      properties: {
        chatId: chatId,
        messageId: message.id,
        messageLength: content.length,
        requestId: chat.requestId,
      },
    }).catch((error) => {
      console.error("Failed to track message_sent event:", error);
      // Don't fail message sending if tracking fails
    });

    // Return success with warning if applicable
    return NextResponse.json({
      message,
      warning: moderation.warning,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
