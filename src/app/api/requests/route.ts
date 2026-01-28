import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { createRequest, listUserRequests, isRequestExpired } from "@/db/queries/requests";
import { createRequestSchema, listRequestsSchema } from "@/lib/validations/request";
import { sendRequestReceivedEmail } from "@/lib/email";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";
import { trackAppEvent } from "@/lib/growth/event-service";

/**
 * GET /api/requests
 * List date requests for the authenticated user
 * Query params: status, asInvitee, asRequester, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    const listInput = {
      status: searchParams.get("status") as "pending" | "approved" | "declined" | undefined,
      asInvitee: searchParams.get("asInvitee") === "true",
      asRequester: searchParams.get("asRequester") === "true",
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 50,
      offset: searchParams.get("offset")
        ? parseInt(searchParams.get("offset")!)
        : 0,
    };

    const validatedInput = listRequestsSchema.parse(listInput);
    const requests = await listUserRequests(user.id, validatedInput);

    // Add expiration status to each request
    const requestsWithExpiration = requests.map((req) => ({
      ...req,
      isExpired: isRequestExpired(req.request),
    }));

    return NextResponse.json({
      requests: requestsWithExpiration,
      count: requestsWithExpiration.length
    });
  } catch (error) {
    console.error("Request listing error:", error);

    if (error instanceof ZodError) {
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

/**
 * POST /api/requests
 * Create a new date request
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createRequestSchema.parse(body);

    // Prevent users from requesting themselves
    if (validatedData.inviteeId === user.id) {
      return NextResponse.json(
        { error: "You cannot create a date request with yourself" },
        { status: 400 }
      );
    }

    const dateRequest = await createRequest({
      ...validatedData,
      requesterId: user.id,
    });

    // Get invitee details to send email notification
    const [invitee] = await db
      .select()
      .from(users)
      .where(eq(users.id, validatedData.inviteeId))
      .limit(1);

    if (invitee) {
      // Send email notification to invitee
      await sendRequestReceivedEmail(
        invitee.email,
        invitee.name,
        user.name || "Unknown"
      );
    }

    // Track request_created event
    await trackAppEvent({
      eventName: "request_created",
      userId: user.id,
      properties: {
        requestId: dateRequest.id,
        inviteeId: validatedData.inviteeId,
        depositAmount: validatedData.depositAmount,
        hasIntroMessage: !!validatedData.introMessage,
        hasScreeningAnswers: !!validatedData.screeningAnswers,
      },
    }).catch((error) => {
      console.error("Failed to track request_created event:", error);
      // Don't fail request creation if tracking fails
    });

    return NextResponse.json(
      { message: "Date request created successfully", request: dateRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error("Request creation error:", error);

    if (error instanceof ZodError) {
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
