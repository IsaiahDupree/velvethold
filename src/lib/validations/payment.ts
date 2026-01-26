import { z } from "zod";

export const createPaymentIntentSchema = z.object({
  requestId: z.string().uuid("Request ID must be a valid UUID"),
  amount: z.number().int().positive("Amount must be a positive integer"),
});

export const processRefundSchema = z.object({
  requestId: z.string().uuid("Request ID must be a valid UUID"),
  reason: z.enum(["declined", "cancelled", "no_show"]).optional(),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
export type ProcessRefundInput = z.infer<typeof processRefundSchema>;
