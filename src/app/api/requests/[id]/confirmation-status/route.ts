import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { getDateConfirmationStatus } from "@/db/queries/date-confirmations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id: requestId } = await params;

    const status = await getDateConfirmationStatus(
      requestId,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error: any) {
    console.error("Error getting confirmation status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get confirmation status" },
      { status: 400 }
    );
  }
}
