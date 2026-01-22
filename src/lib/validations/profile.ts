import { z } from "zod";

/**
 * Intent enum values
 */
export const intentValues = ["dating", "relationship", "friends"] as const;

/**
 * Visibility level enum values
 */
export const visibilityLevelValues = [
  "public",
  "verified",
  "paid",
  "approved",
] as const;

/**
 * Create profile validation schema
 */
export const createProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(100, "Display name must be less than 100 characters"),
  age: z
    .number()
    .int("Age must be a whole number")
    .min(18, "You must be at least 18 years old")
    .max(120, "Invalid age"),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be less than 100 characters"),
  bio: z
    .string()
    .max(2000, "Bio must be less than 2000 characters")
    .optional(),
  intent: z.enum(intentValues).optional(),
  datePreferences: z.union([z.array(z.string()), z.record(z.any())]).optional(),
  boundaries: z
    .string()
    .max(2000, "Boundaries must be less than 2000 characters")
    .optional(),
  screeningQuestions: z.union([z.array(z.string()), z.record(z.any())]).optional(),
  depositAmount: z
    .number()
    .int("Deposit amount must be a whole number")
    .min(0, "Deposit amount cannot be negative")
    .max(100000, "Deposit amount is too high")
    .optional(),
  cancellationPolicy: z
    .string()
    .max(2000, "Cancellation policy must be less than 2000 characters")
    .optional(),
  availabilityVisibility: z.enum(visibilityLevelValues).optional(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;

/**
 * Update profile validation schema (all fields optional)
 */
export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(100, "Display name must be less than 100 characters")
    .optional(),
  age: z
    .number()
    .int("Age must be a whole number")
    .min(18, "You must be at least 18 years old")
    .max(120, "Invalid age")
    .optional(),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be less than 100 characters")
    .optional(),
  bio: z
    .string()
    .max(2000, "Bio must be less than 2000 characters")
    .optional(),
  intent: z.enum(intentValues).optional(),
  datePreferences: z.union([z.array(z.string()), z.record(z.any())]).optional(),
  boundaries: z
    .string()
    .max(2000, "Boundaries must be less than 2000 characters")
    .optional(),
  screeningQuestions: z.union([z.array(z.string()), z.record(z.any())]).optional(),
  depositAmount: z
    .number()
    .int("Deposit amount must be a whole number")
    .min(0, "Deposit amount cannot be negative")
    .max(100000, "Deposit amount is too high")
    .optional(),
  cancellationPolicy: z
    .string()
    .max(2000, "Cancellation policy must be less than 2000 characters")
    .optional(),
  availabilityVisibility: z.enum(visibilityLevelValues).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Search profiles validation schema
 */
export const searchProfilesSchema = z.object({
  query: z.string().max(255, "Search query too long").optional(),
  intent: z.enum(intentValues).optional(),
  city: z.string().max(100, "City name too long").optional(),
  minAge: z
    .number()
    .int("Minimum age must be a whole number")
    .min(18, "Minimum age must be at least 18")
    .max(120, "Invalid minimum age")
    .optional(),
  maxAge: z
    .number()
    .int("Maximum age must be a whole number")
    .min(18, "Maximum age must be at least 18")
    .max(120, "Invalid maximum age")
    .optional(),
  limit: z
    .number()
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .optional(),
  offset: z
    .number()
    .int("Offset must be a whole number")
    .min(0, "Offset cannot be negative")
    .optional(),
});

export type SearchProfilesInput = z.infer<typeof searchProfilesSchema>;

/**
 * Profile ID parameter validation
 */
export const profileIdSchema = z.object({
  id: z.string().uuid("Invalid profile ID"),
});

export type ProfileIdInput = z.infer<typeof profileIdSchema>;
