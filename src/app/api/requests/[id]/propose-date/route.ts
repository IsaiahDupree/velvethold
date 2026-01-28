import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { proposeDateDetails } from "@/db/queries/date-confirmations";
import { proposeDateDetailsSchema } from "@/lib/validations/date-confirmation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id: requestId } = await params;
    const body = await request.json();

    const validated = proposeDateDetailsSchema.parse({
      ...body,
      requestId,
    });

    const updatedRequest = await proposeDateDetails(
      requestId,
      session.user.id,
      new Date(validated.dateTime),
      validated.location,
      validated.details
    );

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error: any) {
    console.error("Error proposing date details:", error);
    return NextResponse.json(
      { error: error.message || "Failed to propose date details" },
      { status: 400 }
    );
  }
}
