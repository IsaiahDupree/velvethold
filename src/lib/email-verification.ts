import { db } from "@/db"
import { emailVerificationTokens, users } from "@/db/schema"
import { eq } from "drizzle-orm"
import crypto from "crypto"

/**
 * Generate a random verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Create an email verification token for a user
 */
export async function createVerificationToken(userId: string, email: string) {
  const token = generateVerificationToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

  const [verificationToken] = await db
    .insert(emailVerificationTokens)
    .values({
      userId,
      email,
      token,
      expiresAt,
    })
    .returning()

  return verificationToken
}

/**
 * Verify an email verification token
 */
export async function verifyEmailToken(token: string) {
  // Find the token
  const [verificationToken] = await db
    .select()
    .from(emailVerificationTokens)
    .where(eq(emailVerificationTokens.token, token))
    .limit(1)

  if (!verificationToken) {
    return { success: false, error: "Invalid verification token" }
  }

  // Check if token is expired
  if (verificationToken.expiresAt < new Date()) {
    // Delete expired token
    await db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.id, verificationToken.id))

    return { success: false, error: "Verification token has expired" }
  }

  // Update user's verification status
  await db
    .update(users)
    .set({ verificationStatus: "verified" })
    .where(eq(users.id, verificationToken.userId))

  // Delete the used token
  await db
    .delete(emailVerificationTokens)
    .where(eq(emailVerificationTokens.id, verificationToken.id))

  return { success: true, userId: verificationToken.userId }
}

/**
 * Get verification token by user ID
 */
export async function getVerificationTokenByUserId(userId: string) {
  const [token] = await db
    .select()
    .from(emailVerificationTokens)
    .where(eq(emailVerificationTokens.userId, userId))
    .limit(1)

  return token
}

/**
 * Delete verification tokens for a user
 */
export async function deleteVerificationTokens(userId: string) {
  await db
    .delete(emailVerificationTokens)
    .where(eq(emailVerificationTokens.userId, userId))
}
