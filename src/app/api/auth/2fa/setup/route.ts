import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user already has 2FA enabled
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "Two-factor authentication is already enabled" },
        { status: 400 }
      );
    }

    // Generate a secret
    const secret = speakeasy.generateSecret({
      name: `VelvetHold (${user.email})`,
      issuer: "VelvetHold",
    });

    // Store the secret temporarily (not enabled yet)
    await db
      .update(users)
      .set({
        twoFactorSecret: secret.base32,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || "");

    return NextResponse.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Failed to setup two-factor authentication" },
      { status: 500 }
    );
  }
}
