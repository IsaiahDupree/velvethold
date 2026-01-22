import { z } from "zod";

/**
 * User role enum values
 */
export const userRoleValues = ["invitee", "requester", "both"] as const;

/**
 * Verification status enum values
 */
export const verificationStatusValues = [
  "unverified",
  "pending",
  "verified",
] as const;

/**
 * Update user validation schema
 */
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters")
    .optional(),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .optional(),
  phone: z
    .string()
    .max(20, "Phone number must be less than 20 characters")
    .regex(/^[+]?[0-9\s\-()]+$/, "Invalid phone number format")
    .optional()
    .nullable(),
  role: z.enum(userRoleValues).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/**
 * User ID parameter validation
 */
export const userIdSchema = z.object({
  id: z.string().uuid("Invalid user ID"),
});

export type UserIdInput = z.infer<typeof userIdSchema>;
