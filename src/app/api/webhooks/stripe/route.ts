import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { payments, dateRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 *
 * Events handled:
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - payment_intent.canceled
 * - charge.refunded
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  console.log(`Processing webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentCanceled(paymentIntent);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment intent succeeded: ${paymentIntent.id}`);

  // Update payment status
  const [payment] = await db
    .update(payments)
    .set({
      status: "succeeded",
      updatedAt: new Date(),
    })
    .where(eq(payments.stripePaymentIntentId, paymentIntent.id))
    .returning();

  if (!payment) {
    console.error(`Payment not found for payment intent: ${paymentIntent.id}`);
    return;
  }

  // Update date request deposit status
  await db
    .update(dateRequests)
    .set({
      depositStatus: "held",
      updatedAt: new Date(),
    })
    .where(eq(dateRequests.id, payment.requestId));

  console.log(`Updated payment and request for payment intent: ${paymentIntent.id}`);
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment intent failed: ${paymentIntent.id}`);

  // Update payment status
  await db
    .update(payments)
    .set({
      status: "failed",
      updatedAt: new Date(),
    })
    .where(eq(payments.stripePaymentIntentId, paymentIntent.id));

  console.log(`Marked payment as failed for payment intent: ${paymentIntent.id}`);
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment intent canceled: ${paymentIntent.id}`);

  // Update payment status
  await db
    .update(payments)
    .set({
      status: "failed",
      updatedAt: new Date(),
    })
    .where(eq(payments.stripePaymentIntentId, paymentIntent.id));

  console.log(`Marked payment as failed for canceled intent: ${paymentIntent.id}`);
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log(`Charge refunded: ${charge.id}`);

  if (!charge.payment_intent) {
    console.error("No payment intent associated with charge");
    return;
  }

  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent.id;

  // Update payment status
  const [payment] = await db
    .update(payments)
    .set({
      status: "refunded",
      updatedAt: new Date(),
    })
    .where(eq(payments.stripePaymentIntentId, paymentIntentId))
    .returning();

  if (!payment) {
    console.error(`Payment not found for payment intent: ${paymentIntentId}`);
    return;
  }

  // Update date request deposit status
  await db
    .update(dateRequests)
    .set({
      depositStatus: "refunded",
      updatedAt: new Date(),
    })
    .where(eq(dateRequests.id, payment.requestId));

  console.log(`Updated payment and request for refunded charge: ${charge.id}`);
}
