import { z } from "zod";

export const createPaymentIntentSchema = z.object({
  requestId: z.string().uuid("Request ID must be a valid UUID"),
  amount: z.number().int().positive("Amount must be a positive integer"),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
