import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { confirmDateDetails } from "@/db/queries/date-confirmations";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id: requestId } = await params;

    const updatedRequest = await confirmDateDetails(
      requestId,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error: any) {
    console.error("Error confirming date details:", error);
    return NextResponse.json(
      { error: error.message || "Failed to confirm date details" },
      { status: 400 }
    );
  }
}
