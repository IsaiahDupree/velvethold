import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const [user] = await db
      .select({ id: users.id, twoFactorEnabled: users.twoFactorEnabled })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      // Return false even if user doesn't exist (for security)
      return NextResponse.json({
        twoFactorEnabled: false,
      });
    }

    return NextResponse.json({
      twoFactorEnabled: user.twoFactorEnabled || false,
      userId: user.twoFactorEnabled ? user.id : undefined,
    });
  } catch (error) {
    console.error("2FA check error:", error);
    return NextResponse.json(
      { error: "Failed to check 2FA status" },
      { status: 500 }
    );
  }
}
