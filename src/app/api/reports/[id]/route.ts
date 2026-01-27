import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getReportById, updateReportStatus, userOwnsReport } from "@/db/queries/reports";
import { updateReportSchema } from "@/lib/validations/report";
import { ZodError } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const report = await getReportById(id);

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check if user owns the report or is an admin
    const isOwner = await userOwnsReport(id, session.user.id);
    if (!isOwner) {
      // In a real app, check if user is admin/moderator
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const report = await getReportById(id);

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // In a real app, only admins/moderators should update reports
    // For now, we'll allow any authenticated user

    const body = await req.json();
    const validatedData = updateReportSchema.parse(body);

    const updatedReport = await updateReportStatus(id, {
      ...validatedData,
      reviewedBy: session.user.id,
    });

    return NextResponse.json({
      message: "Report updated successfully",
      report: updatedReport,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}
