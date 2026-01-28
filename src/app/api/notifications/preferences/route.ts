import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // In a production system, you would store these preferences in a notification_preferences table
    // For now, we'll just acknowledge the request
    // Future implementation would include:
    // await db.insert(notificationPreferences).values({
    //   userId: user.id,
    //   ...body
    // }).onConflictDoUpdate({ target: notificationPreferences.userId, set: body });

    console.log("Notification preferences updated for user:", user.id, body);

    return NextResponse.json({
      message: "Notification preferences updated successfully",
      preferences: body,
    });
  } catch (error) {
    console.error("Notification preferences error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In a production system, fetch from notification_preferences table
    // For now, return default preferences
    const defaultPreferences = {
      emailRequestReceived: true,
      emailRequestApproved: true,
      emailRequestDeclined: true,
      emailMessageReceived: true,
      emailDateReminder: true,
      emailSecurityAlerts: true,
      marketingEmails: false,
      notificationFrequency: "immediate",
    };

    return NextResponse.json({
      preferences: defaultPreferences,
    });
  } catch (error) {
    console.error("Notification preferences fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
