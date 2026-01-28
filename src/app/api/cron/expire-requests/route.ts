import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dateRequests } from "@/db/schema";
import { and, eq, lt } from "drizzle-orm";
import { processRefund } from "@/lib/stripe";

/**
 * POST /api/cron/expire-requests
 * Cron job to automatically decline expired requests and process refunds
 * This should be called periodically (e.g., every hour) by a cron service like Vercel Cron
 *
 * Authorization: Requires CRON_SECRET in headers for security
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find all pending requests that have expired
    const expiredRequests = await db
      .select()
      .from(dateRequests)
      .where(
        and(
          eq(dateRequests.approvalStatus, "pending"),
          lt(dateRequests.expiresAt, new Date())
        )
      );

    console.log(`Found ${expiredRequests.length} expired requests to process`);

    const results = {
      processed: 0,
      failed: 0,
      refundsProcessed: 0,
      refundsFailed: 0,
    };

    // Process each expired request
    for (const request of expiredRequests) {
      try {
        // Update request status to declined
        await db
          .update(dateRequests)
          .set({
            approvalStatus: "declined",
            updatedAt: new Date(),
          })
          .where(eq(dateRequests.id, request.id));

        results.processed++;

        // Attempt to process refund
        try {
          await processRefund(request.id);
          results.refundsProcessed++;
          console.log(`Refund processed for expired request: ${request.id}`);
        } catch (refundError) {
          console.error(`Failed to process refund for request ${request.id}:`, refundError);
          results.refundsFailed++;
        }
      } catch (error) {
        console.error(`Failed to decline expired request ${request.id}:`, error);
        results.failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} expired requests`,
      results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/expire-requests
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "expire-requests",
    description: "Automatically declines expired date requests",
  });
}
