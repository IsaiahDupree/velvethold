import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcrypt"
import { createVerificationToken } from "@/lib/email-verification"
import { sendVerificationEmail } from "@/lib/email"
import { signUpSchema } from "@/lib/validations/auth"
import { ZodError } from "zod"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input with Zod
    const validatedData = signUpSchema.parse(body)
    const { name, email, password } = validatedData

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role: "requester", // Default role
        verificationStatus: "unverified", // Email not verified yet
      })
      .returning()

    // Create verification token
    const verificationToken = await createVerificationToken(newUser.id, email)

    // Send verification email
    await sendVerificationEmail(email, verificationToken.token)

    return NextResponse.json(
      {
        message: "User created successfully. Please check your email to verify your account.",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Sign up error:", error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
