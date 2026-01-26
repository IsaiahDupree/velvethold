import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { processRefundSchema } from "@/lib/validations/payment";
import { db } from "@/db";
import { dateRequests, payments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ZodError } from "zod";

/**
 * POST /api/payments/refund
 * Process a refund for a date request deposit
 *
 * This endpoint can be called when:
 * - An invitee declines a request
 * - A date is cancelled
 * - A no-show occurs
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = processRefundSchema.parse(body);

    // Verify the request exists
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

    // Verify user is involved in the request (either invitee or requester)
    if (dateRequest.inviteeId !== user.id && dateRequest.requesterId !== user.id) {
      return NextResponse.json(
        { error: "You are not authorized to process this refund" },
        { status: 403 }
      );
    }

    // Check if deposit is in a refundable state
    if (dateRequest.depositStatus === "refunded") {
      return NextResponse.json(
        { error: "Deposit has already been refunded" },
        { status: 400 }
      );
    }

    if (dateRequest.depositStatus === "released") {
      return NextResponse.json(
        { error: "Deposit has already been released to invitee" },
        { status: 400 }
      );
    }

    if (dateRequest.depositStatus === "pending") {
      return NextResponse.json(
        { error: "Payment is still pending" },
        { status: 400 }
      );
    }

    // Get the payment record
    const [payment] = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.requestId, validatedData.requestId),
          eq(payments.status, "succeeded")
        )
      )
      .limit(1);

    if (!payment || !payment.stripePaymentIntentId) {
      return NextResponse.json(
        { error: "No successful payment found for this request" },
        { status: 404 }
      );
    }

    // Process refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      metadata: {
        requestId: validatedData.requestId,
        reason: validatedData.reason || "request_declined",
      },
    });

    // Update payment status
    await db
      .update(payments)
      .set({
        status: "refunded",
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    // Update date request deposit status
    await db
      .update(dateRequests)
      .set({
        depositStatus: "refunded",
        updatedAt: new Date(),
      })
      .where(eq(dateRequests.id, validatedData.requestId));

    return NextResponse.json({
      message: "Refund processed successfully",
      refundId: refund.id,
      amount: refund.amount,
      status: refund.status,
    });
  } catch (error) {
    console.error("Refund processing error:", error);

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
