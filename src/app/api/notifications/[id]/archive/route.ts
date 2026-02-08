import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { archiveNotification } from "@/db/queries/notifications";

/**
 * PATCH /api/notifications/[id]/archive
 * Archive a specific notification (hide from inbox)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await archiveNotification(id);

    return NextResponse.json({
      message: "Notification archived successfully",
    });
  } catch (error) {
    console.error("Error archiving notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
