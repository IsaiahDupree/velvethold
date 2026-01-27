import { z } from "zod";

export const reportTypeEnum = z.enum([
  "harassment",
  "inappropriate_behavior",
  "fake_profile",
  "scam",
  "offensive_content",
  "other",
]);

export const reportStatusEnum = z.enum([
  "pending",
  "under_review",
  "resolved",
  "dismissed",
]);

export const createReportSchema = z.object({
  reportedUserId: z.string().uuid("Invalid user ID"),
  reportType: reportTypeEnum,
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must not exceed 2000 characters"),
  context: z.enum(["request", "chat", "profile"]).optional(),
  contextId: z.string().uuid("Invalid context ID").optional(),
});

export const updateReportSchema = z.object({
  status: reportStatusEnum.optional(),
  reviewNotes: z.string().max(2000).optional(),
  actionTaken: z.enum(["warning", "block", "none"]).optional(),
});

export const listReportsSchema = z.object({
  status: reportStatusEnum.optional(),
  reportedUserId: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
export type ListReportsInput = z.infer<typeof listReportsSchema>;
