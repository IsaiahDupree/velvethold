import { db } from "@/db";
import { inAppNotification } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

/**
 * Create an in-app notification
 */
export async function createInAppNotification(
  userId: string,
  data: {
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    actionUrl?: string;
  }
) {
  const [notification] = await db
    .insert(inAppNotification)
    .values({
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || null,
      actionUrl: data.actionUrl || null,
    })
    .returning();

  return notification;
}

/**
 * Get user's notifications with optional filtering
 */
export async function getUserNotifications(
  userId: string,
  options?: {
    filter?: "all" | "unread" | "archived";
    limit?: number;
    offset?: number;
  }
) {
  let whereCondition;

  // Apply filters
  if (options?.filter === "unread") {
    whereCondition = and(
      eq(inAppNotification.userId, userId),
      eq(inAppNotification.read, false),
      eq(inAppNotification.archived, false)
    );
  } else if (options?.filter === "archived") {
    whereCondition = and(
      eq(inAppNotification.userId, userId),
      eq(inAppNotification.archived, true)
    );
  } else {
    // "all" - show non-archived notifications
    whereCondition = and(
      eq(inAppNotification.userId, userId),
      eq(inAppNotification.archived, false)
    );
  }

  const query = db
    .select()
    .from(inAppNotification)
    .where(whereCondition)
    .orderBy(desc(inAppNotification.createdAt))
    .limit(options?.limit || 50)
    .offset(options?.offset || 0);

  return await query;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string) {
  const [notification] = await db
    .update(inAppNotification)
    .set({
      read: true,
      updatedAt: new Date(),
    })
    .where(eq(inAppNotification.id, notificationId))
    .returning();

  return notification;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string) {
  await db
    .update(inAppNotification)
    .set({
      read: true,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(inAppNotification.userId, userId),
        eq(inAppNotification.read, false)
      )
    );
}

/**
 * Archive a notification (hides it from the inbox)
 */
export async function archiveNotification(notificationId: string) {
  const [notification] = await db
    .update(inAppNotification)
    .set({
      archived: true,
      updatedAt: new Date(),
    })
    .where(eq(inAppNotification.id, notificationId))
    .returning();

  return notification;
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string) {
  const [notification] = await db
    .delete(inAppNotification)
    .where(eq(inAppNotification.id, notificationId))
    .returning();

  return notification;
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string) {
  const result = await db
    .select({ count: inAppNotification.id })
    .from(inAppNotification)
    .where(
      and(
        eq(inAppNotification.userId, userId),
        eq(inAppNotification.read, false),
        eq(inAppNotification.archived, false)
      )
    );

  return result.length;
}
