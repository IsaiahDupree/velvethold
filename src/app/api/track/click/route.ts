import { NextRequest, NextResponse } from "next/server";
import { trackEvent } from "@/db/queries/growth-data-plane";
import { v4 as uuidv4 } from "uuid";

/**
 * GET /api/track/click
 * Click tracking redirect endpoint for email attribution
 *
 * Query params:
 * - url: Destination URL (required)
 * - email_id: Email message ID from Resend (optional)
 * - person_id: Person ID for attribution (optional)
 * - campaign: Campaign identifier (optional)
 * - source: Traffic source (optional)
 *
 * Flow:
 * 1. Extract tracking parameters
 * 2. Generate or retrieve session ID
 * 3. Store click event with attribution data
 * 4. Set first-party cookie for attribution
 * 5. Redirect to destination URL
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const destinationUrl = searchParams.get("url");

  // Validate required parameter
  if (!destinationUrl) {
    return NextResponse.json(
      { error: "Missing required parameter: url" },
      { status: 400 }
    );
  }

  // Extract tracking parameters
  const emailId = searchParams.get("email_id");
  const personId = searchParams.get("person_id");
  const campaign = searchParams.get("campaign");
  const source = searchParams.get("source") || "email";

  // Get or generate session ID
  const cookieSessionId = request.cookies.get("vh_session_id")?.value;
  const sessionId = cookieSessionId || uuidv4();

  // Extract user context
  const userAgent = request.headers.get("user-agent");
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ipAddress = forwardedFor?.split(",")[0] || realIp || "unknown";

  // Build attribution properties
  const properties: Record<string, any> = {
    destination_url: destinationUrl,
    click_source: source,
  };

  if (emailId) properties.email_id = emailId;
  if (campaign) properties.campaign = campaign;
  if (userAgent) properties.user_agent = userAgent;
  if (ipAddress) properties.ip_address = ipAddress;

  // Store click tracking event
  try {
    await trackEvent({
      personId: personId || undefined,
      eventName: "email_link_clicked",
      source: "email",
      properties,
      sessionId,
      userAgent: userAgent || undefined,
      ipAddress: ipAddress !== "unknown" ? ipAddress : undefined,
    });

    console.log(`Tracked click: ${destinationUrl} (session: ${sessionId})`);
  } catch (error) {
    console.error("Error tracking click:", error);
    // Don't fail redirect even if tracking fails
  }

  // Create response with redirect
  const response = NextResponse.redirect(destinationUrl);

  // Set first-party session cookie for attribution (30 days)
  if (!cookieSessionId) {
    response.cookies.set("vh_session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });
  }

  // Set attribution cookie with email campaign data (30 days)
  if (emailId || campaign) {
    const attributionData = {
      source: source,
      ...(emailId && { email_id: emailId }),
      ...(campaign && { campaign: campaign }),
      ...(personId && { person_id: personId }),
      clicked_at: new Date().toISOString(),
    };

    response.cookies.set("vh_attribution", JSON.stringify(attributionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });
  }

  return response;
}
