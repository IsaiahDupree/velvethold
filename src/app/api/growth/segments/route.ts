/**
 * Segments API
 * POST /api/growth/segments - Create a segment
 * GET /api/growth/segments - List all segments
 */

import { NextResponse } from "next/server";
import { createSegment, getActiveSegments } from "@/db/queries/growth-data-plane";
import type { SegmentCriteria, AutomationConfig } from "@/lib/growth/segment-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, criteria, automationConfig } = body;

    if (!name || !criteria) {
      return NextResponse.json(
        { error: "Name and criteria are required" },
        { status: 400 }
      );
    }

    const segment = await createSegment({
      name,
      description,
      criteria: criteria as SegmentCriteria,
      automationConfig: automationConfig as AutomationConfig,
    });

    return NextResponse.json({ segment });
  } catch (error) {
    console.error("Error creating segment:", error);
    return NextResponse.json(
      { error: "Failed to create segment" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const segments = await getActiveSegments();
    return NextResponse.json({ segments });
  } catch (error) {
    console.error("Error fetching segments:", error);
    return NextResponse.json(
      { error: "Failed to fetch segments" },
      { status: 500 }
    );
  }
}
