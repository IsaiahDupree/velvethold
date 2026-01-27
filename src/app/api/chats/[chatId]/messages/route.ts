import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { createMessage, userIsParticipant } from "@/db/queries/chats";
import { z } from "zod";

const messageSchema = z.object({
  content: z.string().min(1).max(5000),
});

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

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
