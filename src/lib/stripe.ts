import Stripe from 'stripe';
import { db } from '@/db';
import { dateRequests, payments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

export const STRIPE_CONFIG = {
  currency: 'usd',
  depositAmount: 5000, // $50.00 in cents
  applicationFee: 500, // $5.00 platform fee in cents
} as const;

/**
 * Release a deposit back to the requester when a date is completed successfully
 * @param requestId - The ID of the date request
 * @returns The refund object from Stripe
 */
export async function releaseDepositOnCompletion(requestId: string) {
  return processRefund(requestId, 'date_completed');
}

/**
 * Process a refund for a date request deposit
 * @param requestId - The ID of the date request
 * @param reason - Optional reason for the refund
 * @returns The refund object from Stripe
 */
export async function processRefund(requestId: string, reason?: string) {
  // Get the date request
  const [dateRequest] = await db
    .select()
    .from(dateRequests)
    .where(eq(dateRequests.id, requestId))
    .limit(1);

  if (!dateRequest) {
    throw new Error('Date request not found');
  }

  // Check if deposit is in a refundable state
  if (dateRequest.depositStatus === 'refunded') {
    throw new Error('Deposit has already been refunded');
  }

  if (dateRequest.depositStatus === 'released') {
    throw new Error('Deposit has already been released to invitee');
  }

  if (dateRequest.depositStatus === 'pending') {
    throw new Error('Payment is still pending');
  }

  // Get the payment record
  const [payment] = await db
    .select()
    .from(payments)
    .where(
      and(
        eq(payments.requestId, requestId),
        eq(payments.status, 'succeeded')
      )
    )
    .limit(1);

  if (!payment || !payment.stripePaymentIntentId) {
    throw new Error('No successful payment found for this request');
  }

  // Process refund with Stripe
  const refund = await stripe.refunds.create({
    payment_intent: payment.stripePaymentIntentId,
    metadata: {
      requestId: requestId,
      reason: reason || 'request_declined',
    },
  });

  // Update payment status
  await db
    .update(payments)
    .set({
      status: 'refunded',
      updatedAt: new Date(),
    })
    .where(eq(payments.id, payment.id));

  // Update date request deposit status
  await db
    .update(dateRequests)
    .set({
      depositStatus: 'refunded',
      updatedAt: new Date(),
    })
    .where(eq(dateRequests.id, requestId));

  return {
    refundId: refund.id,
    amount: refund.amount,
    status: refund.status,
  };
}
