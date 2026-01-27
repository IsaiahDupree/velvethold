import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listUserReports } from "@/db/queries/reports";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reports = await listUserReports(session.user.id);

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching user reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
