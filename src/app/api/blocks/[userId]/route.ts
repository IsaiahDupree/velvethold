import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { removeBlock, isUserBlocked } from "@/db/queries/blocks";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    // Check if the user is actually blocked
    const isBlocked = await isUserBlocked(session.user.id, userId);

    if (!isBlocked) {
      return NextResponse.json(
        { error: "User is not blocked" },
        { status: 404 }
      );
    }

    await removeBlock(session.user.id, userId);

    return NextResponse.json({
      message: "User unblocked successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Error unblocking user:", error);
    return NextResponse.json(
      { error: "Failed to unblock user" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    const isBlocked = await isUserBlocked(session.user.id, userId);

    return NextResponse.json({ isBlocked });
  } catch (error) {
    console.error("Error checking block status:", error);
    return NextResponse.json(
      { error: "Failed to check block status" },
      { status: 500 }
    );
  }
}
