import { z } from "zod";

export const accountStatusEnum = z.enum([
  "active",
  "flagged",
  "suspended",
  "banned",
]);

export const updateUserStatusSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  accountStatus: accountStatusEnum,
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason must not exceed 500 characters"),
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
