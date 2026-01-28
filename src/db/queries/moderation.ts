import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Update user account status (for moderation)
 */
export async function updateUserAccountStatus(
  userId: string,
  accountStatus: "active" | "flagged" | "suspended" | "banned"
) {
  const [updatedUser] = await db
    .update(users)
    .set({
      accountStatus,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return updatedUser;
}

/**
 * Get user account status
 */
export async function getUserAccountStatus(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      accountStatus: true,
    },
  });

  return user;
}

/**
 * Check if user is allowed to use the platform
 */
export async function isUserAllowed(userId: string): Promise<boolean> {
  const user = await getUserAccountStatus(userId);

  if (!user) {
    return false;
  }

  // Only active and flagged users can use the platform
  // Suspended and banned users are blocked
  return user.accountStatus === "active" || user.accountStatus === "flagged";
}
