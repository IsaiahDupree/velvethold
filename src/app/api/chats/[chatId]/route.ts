import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { getChatById } from "@/db/queries/chats";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await requireAuth();
    const { chatId } = await params;

    // Fetch chat data
    const chatData = await getChatById(chatId, session.user.id);

    if (!chatData) {
      return NextResponse.json(
        { error: "Chat not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ chat: chatData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}
