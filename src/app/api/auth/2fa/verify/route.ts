import { NextRequest, NextResponse } from "next/server";
import speakeasy from "speakeasy";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, token } = body;

    if (!userId || !token) {
      return NextResponse.json(
        { error: "User ID and token are required" },
        { status: 400 }
      );
    }

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: "Two-factor authentication is not enabled" },
        { status: 400 }
      );
    }

    // Check if token is a backup code
    const backupCodes = user.twoFactorBackupCodes as string[] | null;
    if (backupCodes && backupCodes.includes(token.toUpperCase())) {
      // Remove used backup code
      const updatedBackupCodes = backupCodes.filter(
        (code) => code !== token.toUpperCase()
      );

      await db
        .update(users)
        .set({
          twoFactorBackupCodes: updatedBackupCodes,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      return NextResponse.json({
        success: true,
        message: "Backup code verified successfully",
      });
    }

    // Verify TOTP token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: 2,
    });

    if (!verified) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Token verified successfully",
    });
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 500 }
    );
  }
}
