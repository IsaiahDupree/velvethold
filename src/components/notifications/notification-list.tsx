"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Inbox,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Trash2,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface InAppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  archived: boolean;
  createdAt: string;
  action?: string;
  actionUrl?: string;
}

interface NotificationListProps {
  onUnreadCountChange?: (count: number) => void;
  onMarkAllAsRead?: () => void;
}

/**
 * NotificationList Component
 * Displays in-app notifications with filtering, marking as read, and actions
 */

export function NotificationList({
  onUnreadCountChange,
  onMarkAllAsRead,
}: NotificationListProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Fetch notifications
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/notifications?filter=${filter}`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();
        setNotifications(data.notifications || []);

        // Update unread count
        const unreadCount = data.notifications.filter(
          (n: InAppNotification) => !n.read
        ).length;
        onUnreadCountChange?.(unreadCount);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval);
  }, [session?.user?.id, filter, onUnreadCountChange]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );

      const unreadCount = notifications.filter((n) => !n.read).length - 1;
      onUnreadCountChange?.(Math.max(0, unreadCount));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleArchive = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/archive`, {
        method: "PATCH",
      });

      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
    } catch (error) {
      console.error("Error archiving notification:", error);
    }
  };

  const handleNotificationClick = (notification: InAppNotification) => {
    handleMarkAsRead(notification.id);

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    } else if (notification.data?.action) {
      switch (notification.data.action) {
        case "view_request":
          if (notification.data?.requestId) {
            router.push(`/inbox/${notification.data.requestId}`);
          } else {
            router.push("/inbox");
          }
          break;
        case "open_chat":
          if (notification.data?.chatId) {
            router.push(`/chat/${notification.data.chatId}`);
          }
          break;
        case "browse_profiles":
          router.push("/browse");
          break;
        default:
          break;
      }
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "request_received":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case "request_approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "message_received":
        return <MessageCircle className="h-4 w-4 text-purple-600" />;
      default:
        return <Inbox className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading notifications...</div>
      </div>
    );
  }

  if (filteredNotifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Inbox className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-center">
          {filter === "unread" ? "No unread notifications" : "No notifications yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-4">
      {/* Filter tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-3 py-2 text-sm font-medium border-b-2 transition-colors",
            filter === "all"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          )}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={cn(
            "px-3 py-2 text-sm font-medium border-b-2 transition-colors",
            filter === "unread"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          )}
        >
          Unread
        </button>
      </div>

      {/* Notification items */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-900",
              notification.read
                ? "bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800"
                : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
            )}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0">
                {getIconForType(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <Badge variant="secondary" className="text-xs">
                      New
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchive(notification.id);
                  }}
                  title="Archive"
                >
                  <Archive className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification.id);
                  }}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
