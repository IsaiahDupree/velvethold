/**
 * Person Features Computation API
 *
 * POST /api/growth/features/compute
 *
 * Triggers computation of person features from events.
 * Can compute for a specific person or batch of people.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  computePersonFeatures,
  batchComputePersonFeatures,
  computeFeaturesForRecentActivity,
} from "@/lib/growth/features-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Single person computation
    if (body.personId) {
      await computePersonFeatures(body.personId);
      return NextResponse.json({
        success: true,
        message: `Features computed for person ${body.personId}`,
      });
    }

    // Batch computation for specific people
    if (body.personIds && Array.isArray(body.personIds)) {
      await batchComputePersonFeatures(body.personIds);
      return NextResponse.json({
        success: true,
        message: `Features computed for ${body.personIds.length} people`,
      });
    }

    // Compute for all people with recent activity
    if (body.recentActivity) {
      const daysBack = body.daysBack || 7;
      await computeFeaturesForRecentActivity(daysBack);
      return NextResponse.json({
        success: true,
        message: `Features computed for people with activity in the last ${daysBack} days`,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Must provide personId, personIds array, or recentActivity flag",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error computing person features:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/growth/features/compute
 *
 * Get information about the features computation system
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/growth/features/compute",
    description: "Compute person behavioral features from events",
    methods: {
      POST: {
        description: "Trigger feature computation",
        examples: [
          {
            title: "Compute for single person",
            body: {
              personId: "uuid-here",
            },
          },
          {
            title: "Batch compute for multiple people",
            body: {
              personIds: ["uuid-1", "uuid-2", "uuid-3"],
            },
          },
          {
            title: "Compute for recent activity",
            body: {
              recentActivity: true,
              daysBack: 7, // Optional, defaults to 7
            },
          },
        ],
      },
    },
    features: {
      activeDays: "Number of unique calendar days with activity",
      coreActions: "Count of key product actions (profile_created, date_requested, etc.)",
      pricingViews: "Number of times pricing page was viewed",
      emailOpens: "Count of email open events",
      emailClicks: "Count of email click events",
      lastActiveAt: "Timestamp of most recent activity",
    },
  });
}
