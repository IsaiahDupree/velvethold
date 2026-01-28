/**
 * Segment Statistics API
 * GET /api/growth/segments/[id]/stats - Get segment membership statistics
 */

import { NextResponse } from "next/server";
import { getSegmentStats } from "@/lib/growth/segment-engine";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const stats = await getSegmentStats(params.id);
    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching segment stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch segment statistics" },
      { status: 500 }
    );
  }
}
