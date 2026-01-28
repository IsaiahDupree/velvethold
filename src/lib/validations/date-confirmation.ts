import { z } from "zod";

export const proposeDateDetailsSchema = z.object({
  requestId: z.string().uuid(),
  dateTime: z.string().datetime(),
  location: z.string().min(1).max(500),
  details: z.string().optional(),
});

export const confirmDateSchema = z.object({
  requestId: z.string().uuid(),
});

export type ProposeDateDetailsInput = z.infer<typeof proposeDateDetailsSchema>;
export type ConfirmDateInput = z.infer<typeof confirmDateSchema>;
