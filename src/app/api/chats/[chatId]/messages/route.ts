import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { createMessage, userIsParticipant } from "@/db/queries/chats";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { pusherServer, getChatChannel, PUSHER_EVENTS } from "@/lib/pusher";

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

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
