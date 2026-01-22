import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { users, passwordResetTokens } from "@/db/schema"
import { eq, and, gt } from "drizzle-orm"
import bcrypt from "bcrypt"

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    // Find the reset token and check if it's still valid
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1)

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10)

    // Update user's password
    await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, resetToken.userId))

    // Delete the used reset token
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, resetToken.id))

    return NextResponse.json({
      message: "Password has been reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    )
  }
}
