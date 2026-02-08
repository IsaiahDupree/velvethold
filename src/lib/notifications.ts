/**
 * Notification System for VelvetHold
 * Handles web push notifications, in-app notifications, and email notifications
 */

import { pusherServer } from "./pusher";
import { sendEmail } from "./email";

// Notification types
export enum NotificationType {
  REQUEST_RECEIVED = "request_received",
  REQUEST_APPROVED = "request_approved",
  REQUEST_DECLINED = "request_declined",
  MESSAGE_RECEIVED = "message_received",
  DATE_REMINDER = "date_reminder",
  DEPOSIT_REFUNDED = "deposit_refunded",
  SAFETY_ALERT = "safety_alert",
  PROFILE_BOOST = "profile_boost",
  SUBSCRIPTION_REMINDER = "subscription_reminder",
}

// Notification channels per user
function getUserNotificationChannel(userId: string) {
  return `private-notifications-${userId}`;
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any>;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

/**
 * Send a real-time push notification to a user via Pusher
 * This triggers immediately and can be received by multiple connected clients
 */
export async function sendPushNotification(
  userId: string,
  payload: NotificationPayload
): Promise<void> {
  try {
    const channel = getUserNotificationChannel(userId);
    await pusherServer.trigger(channel, "notification", payload);
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
  }
}

/**
 * Send multiple push notifications in batch
 */
export async function sendBatchPushNotifications(
  userIds: string[],
  payload: NotificationPayload
): Promise<void> {
  const promises = userIds.map((userId) =>
    sendPushNotification(userId, payload).catch((err) => {
      console.error(`Failed to send notification to ${userId}:`, err);
    })
  );

  await Promise.all(promises);
}

/**
 * Notification templates for common events
 */
export const notificationTemplates = {
  requestReceived: (requesterName: string, depositAmount: number): NotificationPayload => ({
    type: NotificationType.REQUEST_RECEIVED,
    title: "New Date Request",
    body: `${requesterName} sent you a date request with a $${depositAmount} deposit`,
    data: {
      action: "view_request",
      timestamp: new Date().toISOString(),
    },
    icon: "/icons/notification-request.png",
    badge: "/icons/notification-badge.png",
    tag: "request_received",
    requireInteraction: true,
  }),

  requestApproved: (inviteeName: string): NotificationPayload => ({
    type: NotificationType.REQUEST_APPROVED,
    title: "Request Approved!",
    body: `${inviteeName} approved your date request. Let's start chatting!`,
    data: {
      action: "open_chat",
      timestamp: new Date().toISOString(),
    },
    icon: "/icons/notification-approved.png",
    badge: "/icons/notification-badge.png",
    tag: "request_approved",
  }),

  requestDeclined: (inviteeName: string): NotificationPayload => ({
    type: NotificationType.REQUEST_DECLINED,
    title: "Request Declined",
    body: `${inviteeName} declined your date request. Keep trying!`,
    data: {
      action: "browse_profiles",
      timestamp: new Date().toISOString(),
    },
    icon: "/icons/notification-declined.png",
    badge: "/icons/notification-badge.png",
    tag: "request_declined",
  }),

  messageReceived: (senderName: string, preview: string): NotificationPayload => ({
    type: NotificationType.MESSAGE_RECEIVED,
    title: `Message from ${senderName}`,
    body: preview.substring(0, 100),
    data: {
      action: "open_chat",
      timestamp: new Date().toISOString(),
    },
    icon: "/icons/notification-message.png",
    badge: "/icons/notification-badge.png",
    tag: "message_received",
  }),

  dateReminder: (partnerName: string, dateTime: string): NotificationPayload => ({
    type: NotificationType.DATE_REMINDER,
    title: "Upcoming Date Reminder",
    body: `Your date with ${partnerName} is coming up at ${dateTime}`,
    data: {
      action: "view_date_details",
      timestamp: new Date().toISOString(),
    },
    icon: "/icons/notification-reminder.png",
    badge: "/icons/notification-badge.png",
    tag: "date_reminder",
    requireInteraction: true,
  }),

  depositRefunded: (amount: number): NotificationPayload => ({
    type: NotificationType.DEPOSIT_REFUNDED,
    title: "Deposit Refunded",
    body: `Your $${amount} deposit has been refunded to your account`,
    data: {
      action: "view_wallet",
      timestamp: new Date().toISOString(),
    },
    icon: "/icons/notification-refund.png",
    badge: "/icons/notification-badge.png",
    tag: "deposit_refunded",
  }),

  safetyAlert: (message: string): NotificationPayload => ({
    type: NotificationType.SAFETY_ALERT,
    title: "Safety Alert",
    body: message,
    data: {
      action: "view_safety_info",
      timestamp: new Date().toISOString(),
    },
    icon: "/icons/notification-safety.png",
    badge: "/icons/notification-badge.png",
    tag: "safety_alert",
    requireInteraction: true,
  }),
};

/**
 * Send a notification with email fallback
 * Useful for important notifications that should reach the user even if they're offline
 */
export async function sendNotificationWithFallback(
  userId: string,
  userEmail: string,
  payload: NotificationPayload,
  emailTemplate?: {
    subject: string;
    html: string;
  }
): Promise<void> {
  // Send push notification
  await sendPushNotification(userId, payload).catch((err) => {
    console.error("Push notification failed, will try email fallback:", err);
  });

  // Send email if template provided
  if (emailTemplate) {
    await sendEmail({
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    }).catch((err) => {
      console.error("Email fallback failed:", err);
    });
  }
}

/**
 * Notification preference constants
 */
export const notificationFrequencies = {
  IMMEDIATE: "immediate",
  HOURLY: "hourly",
  DAILY: "daily",
  WEEKLY: "weekly",
  NEVER: "never",
} as const;

export const notificationChannels = {
  PUSH: "push",
  EMAIL: "email",
  IN_APP: "in_app",
} as const;
