import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  sendPushNotification,
  NotificationPayload,
  NotificationType,
} from "@/lib/notifications";
import { z } from "zod";

/**
 * POST /api/notifications/send
 * Send a notification to a specific user (admin/system only)
 */

const sendNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  data: z.record(z.any()).optional(),
  icon: z.string().optional(),
  badge: z.string().optional(),
  tag: z.string().optional(),
  requireInteraction: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, we'll allow any authenticated user to send (in production, add admin role check)
    // This endpoint is meant to be used internally for system notifications

    const body = await request.json();
    const validated = sendNotificationSchema.parse(body);

    const payload: NotificationPayload = {
      type: validated.type,
      title: validated.title,
      body: validated.body,
      data: validated.data || {},
      icon: validated.icon,
      badge: validated.badge,
      tag: validated.tag,
      requireInteraction: validated.requireInteraction,
    };

    await sendPushNotification(validated.userId, payload);

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications/test
 * Send a test notification to the current user
 */

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: NotificationPayload = {
      type: NotificationType.REQUEST_RECEIVED,
      title: "Test Notification",
      body: "This is a test notification from VelvetHold",
      data: {
        test: true,
        timestamp: new Date().toISOString(),
      },
      icon: "/icons/notification-request.png",
      badge: "/icons/notification-badge.png",
      tag: "test_notification",
    };

    await sendPushNotification(user.id, payload);

    return NextResponse.json({
      success: true,
      message: "Test notification sent to your device",
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
