import { z } from "zod";

export const createRequestSchema = z.object({
  inviteeId: z.string().uuid("Invitee ID must be a valid UUID"),
  slotId: z.string().uuid("Slot ID must be a valid UUID").optional(),
  screeningAnswers: z.record(z.string()).optional(),
  introMessage: z.string().min(10, "Introduction message must be at least 10 characters").max(1000, "Introduction message must not exceed 1000 characters"),
  depositAmount: z.number().int().positive("Deposit amount must be a positive integer"),
});

export const updateRequestStatusSchema = z.object({
  approvalStatus: z.enum(["approved", "declined"]).optional(),
});

export const listRequestsSchema = z.object({
  status: z.enum(["pending", "approved", "declined"]).optional(),
  asInvitee: z.boolean().optional(),
  asRequester: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestStatusInput = z.infer<typeof updateRequestStatusSchema>;
export type ListRequestsInput = z.infer<typeof listRequestsSchema>;
