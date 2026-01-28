import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/db";
import { users, emailVerificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { newEmail } = body;

    if (!newEmail || !newEmail.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Check if email is already in use
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, newEmail))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already in use" },
        { status: 400 }
      );
    }

    // Get user's name for email
    const [dbUser] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(emailVerificationTokens).values({
      userId: user.id,
      token,
      email: newEmail,
      expiresAt,
    });

    // Send verification email to new address
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;

    await sendEmail({
      to: newEmail,
      subject: "Verify Your New Email - VelvetHold",
      html: `
        <h1>Verify Your New Email</h1>
        <p>Hi ${dbUser.name},</p>
        <p>You requested to change your email address to ${newEmail}.</p>
        <p>Please click the link below to verify this email address:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not request this change, please ignore this email.</p>
        <p>Best regards,<br>The VelvetHold Team</p>
      `,
    });

    return NextResponse.json({
      message: "Verification email sent to new address",
    });
  } catch (error) {
    console.error("Email change error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
