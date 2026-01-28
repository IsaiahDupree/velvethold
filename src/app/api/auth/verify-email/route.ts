import { NextRequest, NextResponse } from "next/server"
import { verifyEmailToken } from "@/lib/email-verification"
import { sendWelcomeEmail } from "@/lib/email"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    // Validate input
    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      )
    }

    // Verify the token
    const result = await verifyEmailToken(token)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // At this point, result.success is true, so userId is defined
    const userId = result.userId as string

    // Get user details to send welcome email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (user) {
      // Send welcome email
      await sendWelcomeEmail(user.email, user.name)
    }

    return NextResponse.json(
      {
        message: "Email verified successfully",
        userId,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Also support GET method for URL-based verification
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")

    // Validate input
    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      )
    }

    // Verify the token
    const result = await verifyEmailToken(token)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // At this point, result.success is true, so userId is defined
    const userId = result.userId as string

    // Get user details to send welcome email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (user) {
      // Send welcome email
      await sendWelcomeEmail(user.email, user.name)
    }

    return NextResponse.json(
      {
        message: "Email verified successfully",
        userId,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
