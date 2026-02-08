import { useEffect, useRef, useCallback } from "react";
import { getPusherClient } from "@/lib/pusher";
import { NotificationPayload } from "@/lib/notifications";
import { useRouter } from "next/navigation";

/**
 * Hook to subscribe to push notifications via Pusher
 * Handles notification delivery and user interaction
 */

export function usePushNotifications(userId: string | null) {
  const pusherRef = useRef<ReturnType<typeof getPusherClient> | null>(null);
  const subscriptionRef = useRef<any>(null);
  const router = useRouter();

  // Handle notification click
  const handleNotificationClick = useCallback((action: string, data: Record<string, any>) => {
    switch (action) {
      case "view_request":
        router.push("/inbox");
        break;
      case "open_chat":
        if (data.requestId) {
          router.push(`/chat/${data.requestId}`);
        } else {
          router.push("/inbox");
        }
        break;
      case "browse_profiles":
        router.push("/browse");
        break;
      case "view_date_details":
        if (data.requestId) {
          router.push(`/inbox/${data.requestId}`);
        }
        break;
      case "view_wallet":
        router.push("/settings/wallet");
        break;
      case "view_safety_info":
        router.push("/safety");
        break;
      default:
        console.log("Unknown action:", action);
    }
  }, [router]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    try {
      // Initialize Pusher connection
      pusherRef.current = getPusherClient();

      const channelName = `private-notifications-${userId}`;
      subscriptionRef.current = pusherRef.current.subscribe(channelName);

      // Listen for notifications
      subscriptionRef.current.bind("notification", (data: NotificationPayload) => {
        console.log("Notification received:", data);

        // Show browser notification if permission granted
        if ("Notification" in window && Notification.permission === "granted") {
          const notification = new Notification(data.title, {
            body: data.body,
            icon: data.icon,
            badge: data.badge,
            tag: data.tag,
            requireInteraction: data.requireInteraction || false,
            data: {
              action: data.data?.action,
              ...data.data,
            },
          });

          // Handle notification click
          notification.onclick = () => {
            window.focus();
            handleNotificationClick(data.data?.action, data.data || {});
            notification.close();
          };

          // Handle notification close
          notification.onclose = () => {
            console.log("Notification closed");
          };
        }
      });

      // Handle connection errors
      subscriptionRef.current.bind("pusher:subscription_error", (error: any) => {
        console.error("Pusher subscription error:", error);
      });

      return () => {
        if (subscriptionRef.current) {
          pusherRef.current?.unsubscribe(channelName);
        }
      };
    } catch (error) {
      console.error("Error setting up push notifications:", error);
    }
  }, [userId, handleNotificationClick]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      try {
        const permission = await Notification.requestPermission();
        return permission === "granted";
      } catch (error) {
        console.error("Error requesting notification permission:", error);
        return false;
      }
    }

    return false;
  }, []);

  // Get notification permission status
  const getNotificationPermission = useCallback((): NotificationPermission => {
    if ("Notification" in window) {
      return Notification.permission;
    }
    return "denied";
  }, []);

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/send", {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to send test notification");
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending test notification:", error);
      throw error;
    }
  }, []);

  return {
    requestNotificationPermission,
    getNotificationPermission,
    sendTestNotification,
    isSupported: typeof window !== "undefined" && "Notification" in window,
  };
}
