/**
 * Segment Evaluation API
 * POST /api/growth/segments/evaluate - Evaluate segments for a person or all people
 */

import { NextResponse } from "next/server";
import { evaluateSegmentsAfterEvent, batchEvaluateSegments } from "@/lib/growth/segment-engine";
import { db } from "@/db";
import { person } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { personId, batchAll } = body;

    if (personId) {
      // Evaluate for a single person
      await evaluateSegmentsAfterEvent(personId);
      return NextResponse.json({ success: true, personId });
    } else if (batchAll) {
      // Evaluate for all people
      const allPersons = await db.select({ id: person.id }).from(person);
      const personIds = allPersons.map((p) => p.id);

      // Process in background (or use a job queue in production)
      batchEvaluateSegments(personIds).catch((error) => {
        console.error("Batch evaluation failed:", error);
      });

      return NextResponse.json({
        success: true,
        message: `Started batch evaluation for ${personIds.length} people`,
      });
    } else {
      return NextResponse.json(
        { error: "Either personId or batchAll is required" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error evaluating segments:", error);
    return NextResponse.json(
      { error: "Failed to evaluate segments" },
      { status: 500 }
    );
  }
}
