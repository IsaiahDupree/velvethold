import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/db";
import { reports, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updateReportSchema = z.object({
  reportId: z.string().uuid(),
  status: z.enum(["pending", "under_review", "resolved", "dismissed"]),
  reviewNotes: z.string().optional(),
  actionTaken: z.string().optional(),
});

/**
 * GET /api/admin/reports
 * Fetch reports for admin review
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Check if user is admin
    // For now, allow all authenticated users to access
    // In production: const isAdmin = user.role === "admin";

    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get("status") || "all";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let reportsData: any;
    if (statusFilter !== "all") {
      reportsData = await db
        .select()
        .from(reports)
        .where(eq(reports.status, statusFilter as any))
        .limit(limit)
        .offset(offset);
    } else {
      reportsData = await db
        .select()
        .from(reports)
        .limit(limit)
        .offset(offset);
    }

    return NextResponse.json({
      success: true,
      reports: reportsData,
      count: reportsData.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/reports
 * Update report status and take action
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Check if user is admin
    const body = await request.json();
    const { reportId, status, reviewNotes, actionTaken } =
      updateReportSchema.parse(body);

    // Get the report
    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Update report status
    await db
      .update(reports)
      .set({
        status: status as any,
        reviewNotes: reviewNotes || null,
        reviewedBy: user.id,
        actionTaken: actionTaken || null,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, reportId));

    // Take action on reported user if specified
    if (actionTaken && actionTaken !== "none") {
      const actionStatus =
        actionTaken === "warning"
          ? "flagged"
          : actionTaken === "suspend" || actionTaken === "ban"
          ? "suspended"
          : "active";

      await db
        .update(users)
        .set({
          accountStatus: actionStatus as any,
          updatedAt: new Date(),
        })
        .where(eq(users.id, report.reportedUserId));
    }

    return NextResponse.json({
      success: true,
      message: "Report updated successfully",
      actionTaken: actionTaken || "none",
    });
  } catch (error: any) {
    console.error("Report update error:", error);

    if (error instanceof z.ZodError) {
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
