import { NextRequest, NextResponse } from "next/server";
import { getConfirmedRequestsNeedingRefund } from "@/db/queries/requests";
import { releaseDepositOnCompletion } from "@/lib/stripe";
import { trackEvent } from "@/db/queries/growth-data-plane";

/**
 * POST /api/cron/release-deposits
 * Cron job to automatically release deposits when both parties confirm date completion
 * This should be called periodically (e.g., every 30 minutes) by a cron service like Vercel Cron
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

    // Find all approved requests where both parties have confirmed the date
    const confirmedRequests = await getConfirmedRequestsNeedingRefund();

    console.log(`Found ${confirmedRequests.length} confirmed requests needing deposit release`);

    const results = {
      processed: 0,
      failed: 0,
      refundsProcessed: 0,
      refundsFailed: 0,
    };

    // Process each confirmed request
    for (const request of confirmedRequests) {
      try {
        // Attempt to release the deposit (refund to requester)
        try {
          await releaseDepositOnCompletion(request.id);
          results.refundsProcessed++;
          console.log(`Deposit released for confirmed date request: ${request.id}`);

          // Track deposit refund event
          try {
            await trackEvent({
              eventName: "deposit_refunded_on_completion",
              source: "web",
              properties: {
                requestId: request.id,
                inviteeId: request.inviteeId,
                amount: request.depositAmount,
                reason: "date_completed",
              },
            });
          } catch (trackError) {
            console.warn(`Failed to track event for request ${request.id}:`, trackError);
          }

          results.processed++;
        } catch (refundError) {
          console.error(`Failed to release deposit for request ${request.id}:`, refundError);
          results.refundsFailed++;
          results.failed++;
        }
      } catch (error) {
        console.error(`Unexpected error processing request ${request.id}:`, error);
        results.failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} confirmed date requests for deposit release`,
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
 * GET /api/cron/release-deposits
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "release-deposits",
    description: "Automatically releases deposits when both parties confirm date completion",
  });
}
