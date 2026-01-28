import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { stripe, STRIPE_CONFIG } from "@/lib/stripe";
import { createPaymentIntentSchema } from "@/lib/validations/payment";
import { db } from "@/db";
import { dateRequests, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";
import { trackAppEvent } from "@/lib/growth/event-service";

/**
 * POST /api/payments/create-intent
 * Create a Stripe Payment Intent for a date request deposit
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPaymentIntentSchema.parse(body);

    // Verify the request exists and belongs to the user
    const [dateRequest] = await db
      .select()
      .from(dateRequests)
      .where(eq(dateRequests.id, validatedData.requestId))
      .limit(1);

    if (!dateRequest) {
      return NextResponse.json(
        { error: "Date request not found" },
        { status: 404 }
      );
    }

    if (dateRequest.requesterId !== user.id) {
      return NextResponse.json(
        { error: "You can only create payment intents for your own requests" },
        { status: 403 }
      );
    }

    // Check if payment already exists
    const [existingPayment] = await db
      .select()
      .from(payments)
      .where(eq(payments.requestId, validatedData.requestId))
      .limit(1);

    if (existingPayment && existingPayment.stripePaymentIntentId) {
      // Return existing payment intent if it's still pending or succeeded
      if (existingPayment.status === "pending" || existingPayment.status === "succeeded") {
        return NextResponse.json({
          clientSecret: null,
          paymentIntentId: existingPayment.stripePaymentIntentId,
          message: "Payment intent already exists",
        });
      }
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: validatedData.amount,
      currency: STRIPE_CONFIG.currency,
      metadata: {
        requestId: validatedData.requestId,
        userId: user.id,
        depositType: "date_request",
      },
      description: `Deposit for date request ${validatedData.requestId}`,
    });

    // Create or update payment record
    if (existingPayment) {
      await db
        .update(payments)
        .set({
          stripePaymentIntentId: paymentIntent.id,
          amount: validatedData.amount,
          status: "pending",
          updatedAt: new Date(),
        })
        .where(eq(payments.id, existingPayment.id));
    } else {
      await db.insert(payments).values({
        requestId: validatedData.requestId,
        stripePaymentIntentId: paymentIntent.id,
        amount: validatedData.amount,
        status: "pending",
      });
    }

    // Track checkout_started event
    await trackAppEvent({
      eventName: "checkout_started",
      userId: user.id,
      properties: {
        requestId: validatedData.requestId,
        amount: validatedData.amount,
        currency: STRIPE_CONFIG.currency,
        paymentIntentId: paymentIntent.id,
        depositType: "date_request",
      },
    }).catch((error) => {
      console.error("Failed to track checkout_started event:", error);
      // Don't fail checkout if tracking fails
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
