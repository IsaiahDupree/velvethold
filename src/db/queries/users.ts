import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, or, sql, ilike } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "invitee" | "requester" | "both";
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  role?: "invitee" | "requester" | "both";
  verificationStatus?: "unverified" | "pending" | "verified";
}

export interface UpdateUserPasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface SearchUsersInput {
  query?: string;
  role?: "invitee" | "requester" | "both";
  verificationStatus?: "unverified" | "pending" | "verified";
  limit?: number;
  offset?: number;
}

/**
 * Create a new user with hashed password
 */
export async function createUser(input: CreateUserInput) {
  const passwordHash = await bcrypt.hash(input.password, 10);

  const [user] = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone,
      role: input.role || "requester",
    })
    .returning();

  return user;
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user || null;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user || null;
}

/**
 * Get user by phone
 */
export async function getUserByPhone(phone: string) {
  const [user] = await db.select().from(users).where(eq(users.phone, phone));
  return user || null;
}

/**
 * Update user information
 */
export async function updateUser(id: string, input: UpdateUserInput) {
  const updateData: any = {
    ...input,
    updatedAt: new Date(),
  };

  const [user] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning();

  return user || null;
}

/**
 * Update user password
 */
export async function updateUserPassword(
  id: string,
  input: UpdateUserPasswordInput
) {
  const user = await getUserById(id);

  if (!user) {
    throw new Error("User not found");
  }

  const isValidPassword = await bcrypt.compare(
    input.currentPassword,
    user.passwordHash
  );

  if (!isValidPassword) {
    throw new Error("Current password is incorrect");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 10);

  const [updatedUser] = await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  return updatedUser;
}

/**
 * Verify user password
 */
export async function verifyUserPassword(email: string, password: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    return null;
  }

  return user;
}

/**
 * Update user verification status
 */
export async function updateUserVerificationStatus(
  id: string,
  status: "unverified" | "pending" | "verified"
) {
  const [user] = await db
    .update(users)
    .set({
      verificationStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  return user || null;
}

/**
 * Delete user (soft delete by marking as deleted or hard delete)
 */
export async function deleteUser(id: string) {
  const [user] = await db.delete(users).where(eq(users.id, id)).returning();
  return user || null;
}

/**
 * Search users with filters
 */
export async function searchUsers(input: SearchUsersInput = {}) {
  const { query, role, verificationStatus, limit = 50, offset = 0 } = input;

  const conditions = [];

  if (query) {
    conditions.push(
      or(
        ilike(users.name, `%${query}%`),
        ilike(users.email, `%${query}%`)
      )
    );
  }

  if (role) {
    conditions.push(eq(users.role, role));
  }

  if (verificationStatus) {
    conditions.push(eq(users.verificationStatus, verificationStatus));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const results = await db
    .select()
    .from(users)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(users.createdAt);

  return results;
}

/**
 * Get all users (with pagination)
 */
export async function getAllUsers(limit: number = 50, offset: number = 0) {
  const results = await db
    .select()
    .from(users)
    .limit(limit)
    .offset(offset)
    .orderBy(users.createdAt);

  return results;
}

/**
 * Count total users
 */
export async function countUsers() {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users);

  return result?.count || 0;
}

/**
 * Check if email exists
 */
export async function emailExists(email: string) {
  const user = await getUserByEmail(email);
  return !!user;
}

/**
 * Check if phone exists
 */
export async function phoneExists(phone: string) {
  const user = await getUserByPhone(phone);
  return !!user;
}

/**
 * Get user with profile (using relation)
 */
export async function getUserWithProfile(id: string) {
  const result = await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      profile: true,
    },
  });

  return result || null;
}
