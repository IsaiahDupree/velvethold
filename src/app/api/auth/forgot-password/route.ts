import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { users, passwordResetTokens } from "@/db/schema"
import { eq } from "drizzle-orm"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    // For security, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json({
        message: "If an account exists with that email, a password reset link has been sent.",
      })
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex")

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    // Delete any existing reset tokens for this user
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, user.id))

    // Create new reset token
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    })

    // TODO: Send email with reset link
    // For now, we'll just log it to the console
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`
    console.log(`Password reset link for ${email}: ${resetUrl}`)

    return NextResponse.json({
      message: "If an account exists with that email, a password reset link has been sent.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    )
  }
}
