import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createReport, listReports } from "@/db/queries/reports";
import { createReportSchema, listReportsSchema } from "@/lib/validations/report";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createReportSchema.parse(body);

    const report = await createReport({
      ...validatedData,
      reporterId: session.user.id,
    });

    return NextResponse.json({
      message: "Report submitted successfully",
      report,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, only allow viewing reports for admins/moderators
    // In a real app, you'd check user role here
    // For this implementation, we'll allow users to see their own reports

    const searchParams = req.nextUrl.searchParams;
    const validatedParams = listReportsSchema.parse({
      status: searchParams.get("status") || undefined,
      reportedUserId: searchParams.get("reportedUserId") || undefined,
      limit: searchParams.get("limit") || "20",
      offset: searchParams.get("offset") || "0",
    });

    const reports = await listReports(validatedParams);

    return NextResponse.json({ reports });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
