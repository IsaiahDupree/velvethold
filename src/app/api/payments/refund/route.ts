import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { processRefundSchema } from "@/lib/validations/payment";
import { db } from "@/db";
import { dateRequests, payments, profiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ZodError } from "zod";
import { calculateRefundAmount, parsePolicyType } from "@/lib/deposit-forfeiture";
import { trackAppEvent } from "@/lib/growth/event-service";

/**
 * POST /api/payments/refund
 * Process a refund for a date request deposit with optional partial forfeiture
 *
 * This endpoint can be called when:
 * - An invitee declines a request (full refund)
 * - A date is cancelled (partial refund based on timing and policy)
 * - A no-show occurs (no refund)
 *
 * Query params:
 * - reason: "request_declined" (full) | "date_cancelled" (partial) | "no_show" (none)
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

    // Calculate refund amount based on reason and timing
    let refundAmount = payment.amount; // Default: full refund
    let forfeitureAmount = 0;
    let refundPercentage = 100;
    let reason = "request_declined";

    if (validatedData.reason === "date_cancelled" && dateRequest.confirmedDateTime) {
      // Get invitee's cancellation policy
      const [inviteeProfile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, dateRequest.inviteeId))
        .limit(1);

      if (inviteeProfile && inviteeProfile.cancellationPolicy) {
        const policyType = parsePolicyType(inviteeProfile.cancellationPolicy);
        const calculation = calculateRefundAmount(
          payment.amount,
          dateRequest.confirmedDateTime,
          new Date(),
          policyType
        );

        refundAmount = calculation.refundAmount;
        forfeitureAmount = calculation.forfeitureAmount;
        refundPercentage = calculation.refundPercentage;
        reason = calculation.reason;
      }
    } else if (validatedData.reason === "no_show") {
      // No refund for no-shows
      refundAmount = 0;
      forfeitureAmount = payment.amount;
      refundPercentage = 0;
      reason = "No refund for no-shows per cancellation policy";
    }

    // Process refund with Stripe (full payment first, then separate partial refund)
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: refundAmount,
      metadata: {
        requestId: validatedData.requestId,
        reason: reason,
        refundPercentage: refundPercentage.toString(),
        forfeitureAmount: forfeitureAmount.toString(),
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

    // Track deposit forfeiture event
    if (forfeitureAmount > 0) {
      await trackAppEvent({
        eventName: "deposit_forfeited",
        userId: dateRequest.requesterId,
        properties: {
          requestId: validatedData.requestId,
          depositAmount: payment.amount,
          refundAmount: refundAmount,
          forfeitureAmount: forfeitureAmount,
          refundPercentage: refundPercentage,
          reason: reason,
        },
      }).catch((error) => {
        console.error("Failed to track forfeiture event:", error);
      });
    }

    return NextResponse.json({
      message: "Refund processed successfully",
      refundId: refund.id,
      refundAmount: refundAmount,
      forfeitureAmount: forfeitureAmount,
      refundPercentage: refundPercentage,
      reason: reason,
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
