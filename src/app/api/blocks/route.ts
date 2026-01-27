import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createBlock, getBlockedUsers } from "@/db/queries/blocks";
import { z } from "zod";

const createBlockSchema = z.object({
  blockedUserId: z.string().uuid(),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createBlockSchema.parse(body);

    const block = await createBlock({
      blockerId: session.user.id,
      blockedUserId: validatedData.blockedUserId,
      reason: validatedData.reason,
    });

    return NextResponse.json({
      message: "User blocked successfully",
      block,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Error creating block:", error);
    return NextResponse.json(
      { error: "Failed to block user" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const blockedUsers = await getBlockedUsers(session.user.id);

    return NextResponse.json({ blockedUsers });
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    return NextResponse.json(
      { error: "Failed to fetch blocked users" },
      { status: 500 }
    );
  }
}
