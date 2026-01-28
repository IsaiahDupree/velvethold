import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { payments, dateRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import {
  resolvePersonFromExternalId,
  linkIdentity,
  getOrCreatePerson,
} from "@/lib/growth/identity-service";
import { upsertSubscription } from "@/db/queries/growth-data-plane";
import { trackEvent } from "@/db/queries/growth-data-plane";

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 *
 * Events handled:
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - payment_intent.canceled
 * - charge.refunded
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
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

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
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

/**
 * Get or create person from Stripe customer
 * Maps stripe_customer_id to person_id via identity system
 */
async function getOrCreatePersonFromStripeCustomer(
  customerId: string
): Promise<string> {
  // Try to resolve existing person from stripe customer ID
  let personId = await resolvePersonFromExternalId("stripe", customerId);

  if (personId) {
    return personId;
  }

  // Fetch customer details from Stripe to get email
  const customer = await stripe.customers.retrieve(customerId);

  if (customer.deleted) {
    throw new Error(`Customer ${customerId} has been deleted`);
  }

  // Create or get person using email
  const person = await getOrCreatePerson({
    email: customer.email || undefined,
    phone: customer.phone || undefined,
    name: customer.name || undefined,
    traits: {
      stripeCustomerId: customerId,
    },
  });

  // Link stripe customer ID to person
  await linkIdentity(person.id, {
    provider: "stripe",
    externalId: customerId,
    metadata: {
      email: customer.email,
      name: customer.name,
    },
  });

  return person.id;
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log(`Subscription created: ${subscription.id}`);

  try {
    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

    // Get or create person from customer
    const personId = await getOrCreatePersonFromStripeCustomer(customerId);

    // Get subscription details
    const item = subscription.items.data[0];
    const price = item?.price;
    const product = price?.product;

    // Get product name safely
    let planName: string | undefined;
    if (typeof product === 'string') {
      planName = product;
    } else if (product && 'name' in product) {
      planName = product.name;
    }

    // Calculate MRR (convert to monthly recurring revenue)
    let mrr = 0;
    if (price && price.unit_amount) {
      if (price.recurring?.interval === 'year') {
        mrr = Math.round(price.unit_amount / 12);
      } else {
        mrr = price.unit_amount;
      }
    }

    // Upsert subscription in database
    await upsertSubscription({
      personId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      status: subscription.status as any,
      planName,
      planInterval: price?.recurring?.interval || 'month',
      mrr,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      metadata: {
        items: subscription.items.data.length,
        cancelAt: subscription.cancel_at,
      },
    });

    // Track subscription event
    await trackEvent({
      personId,
      eventName: "subscription_started",
      source: "stripe",
      properties: {
        subscriptionId: subscription.id,
        customerId,
        status: subscription.status,
        planName,
        planInterval: price?.recurring?.interval,
        mrr,
      },
    });

    console.log(`Subscription created for person ${personId}: ${subscription.id}`);
  } catch (error) {
    console.error(`Error handling subscription created:`, error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`Subscription updated: ${subscription.id}`);

  try {
    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

    // Get or create person from customer
    const personId = await getOrCreatePersonFromStripeCustomer(customerId);

    // Get subscription details
    const item = subscription.items.data[0];
    const price = item?.price;
    const product = price?.product;

    // Get product name safely
    let planName: string | undefined;
    if (typeof product === 'string') {
      planName = product;
    } else if (product && 'name' in product) {
      planName = product.name;
    }

    // Calculate MRR
    let mrr = 0;
    if (price && price.unit_amount) {
      if (price.recurring?.interval === 'year') {
        mrr = Math.round(price.unit_amount / 12);
      } else {
        mrr = price.unit_amount;
      }
    }

    // Upsert subscription in database
    await upsertSubscription({
      personId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      status: subscription.status as any,
      planName,
      planInterval: price?.recurring?.interval || 'month',
      mrr,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      metadata: {
        items: subscription.items.data.length,
        cancelAt: subscription.cancel_at,
      },
    });

    // Track subscription status change event if needed
    if (subscription.status === 'canceled' || subscription.status === 'past_due') {
      await trackEvent({
        personId,
        eventName: `subscription_${subscription.status}`,
        source: "stripe",
        properties: {
          subscriptionId: subscription.id,
          customerId,
          status: subscription.status,
          planName,
        },
      });
    }

    console.log(`Subscription updated for person ${personId}: ${subscription.id}`);
  } catch (error) {
    console.error(`Error handling subscription updated:`, error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`Subscription deleted: ${subscription.id}`);

  try {
    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

    // Get or create person from customer
    const personId = await getOrCreatePersonFromStripeCustomer(customerId);

    // Get subscription details
    const item = subscription.items.data[0];
    const price = item?.price;
    const product = price?.product;

    // Get product name safely
    let planName: string | undefined;
    if (typeof product === 'string') {
      planName = product;
    } else if (product && 'name' in product) {
      planName = product.name;
    }

    // Update subscription status to canceled
    await upsertSubscription({
      personId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      status: 'canceled',
      planName,
      planInterval: price?.recurring?.interval || 'month',
      mrr: 0, // No MRR for canceled subscriptions
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: true,
      metadata: {
        items: subscription.items.data.length,
        canceledAt: subscription.canceled_at,
      },
    });

    // Track subscription cancellation event
    await trackEvent({
      personId,
      eventName: "subscription_canceled",
      source: "stripe",
      properties: {
        subscriptionId: subscription.id,
        customerId,
        planName,
        canceledAt: subscription.canceled_at,
      },
    });

    console.log(`Subscription canceled for person ${personId}: ${subscription.id}`);
  } catch (error) {
    console.error(`Error handling subscription deleted:`, error);
    throw error;
  }
}
