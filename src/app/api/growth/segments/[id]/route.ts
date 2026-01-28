/**
 * Segment by ID API
 * GET /api/growth/segments/[id] - Get segment details
 * PATCH /api/growth/segments/[id] - Update segment
 * DELETE /api/growth/segments/[id] - Deactivate segment
 */

import { NextResponse } from "next/server";
import { getSegmentById, updateSegment } from "@/db/queries/growth-data-plane";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const segment = await getSegmentById(params.id);

    if (!segment) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    }

    return NextResponse.json({ segment });
  } catch (error) {
    console.error("Error fetching segment:", error);
    return NextResponse.json(
      { error: "Failed to fetch segment" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { name, description, criteria, automationConfig, isActive } = body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (criteria !== undefined) updates.criteria = criteria;
    if (automationConfig !== undefined) updates.automationConfig = automationConfig;
    if (isActive !== undefined) updates.isActive = isActive;

    const segment = await updateSegment(params.id, updates);

    return NextResponse.json({ segment });
  } catch (error) {
    console.error("Error updating segment:", error);
    return NextResponse.json(
      { error: "Failed to update segment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    // Deactivate instead of deleting
    const segment = await updateSegment(params.id, { isActive: false });

    return NextResponse.json({ segment });
  } catch (error) {
    console.error("Error deactivating segment:", error);
    return NextResponse.json(
      { error: "Failed to deactivate segment" },
      { status: 500 }
    );
  }
}
