"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";
import { AlertCircle, Bell, BellOff, Check } from "lucide-react";

/**
 * NotificationCenter Component
 * Initializes push notification subscriptions and manages notification permissions
 * Should be mounted early in the app (in layout or root component)
 */

export function NotificationCenter() {
  const { data: session } = useSession();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const {
    requestNotificationPermission,
    getNotificationPermission,
    sendTestNotification,
    isSupported,
  } = usePushNotifications(session?.user?.id ?? null);

  // Initialize notification permission on mount
  useEffect(() => {
    const permission = getNotificationPermission();
    setPermissionStatus(permission);

    // Show prompt if not yet decided
    if (permission === "default" && isSupported) {
      setShowPrompt(true);
    }
  }, [isSupported, getNotificationPermission]);

  // Handle permission request
  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const granted = await requestNotificationPermission();
      const newStatus = getNotificationPermission();
      setPermissionStatus(newStatus);
      setShowPrompt(false);

      if (granted) {
        // Send test notification to confirm
        await sendTestNotification();
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!isSupported || !session?.user) {
    return null;
  }

  return (
    <>
      {showPrompt && permissionStatus === "default" && (
        <div className="fixed bottom-4 right-4 max-w-sm z-50">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Enable Notifications</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Get notified about date requests, messages, and important updates
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                disabled={isRequesting}
              >
                Not Now
              </Button>
              <Button
                size="sm"
                onClick={handleRequestPermission}
                disabled={isRequesting}
              >
                {isRequesting ? "Enabling..." : "Enable"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {permissionStatus === "denied" && (
        <div className="fixed bottom-4 right-4 max-w-sm z-50">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg shadow-lg p-4 space-y-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  You've disabled notifications. Enable them in browser settings to receive alerts
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {permissionStatus === "granted" && (
        <div className="hidden">
          {/* Silently monitor notifications when permission is granted */}
        </div>
      )}
    </>
  );
}

/**
 * NotificationPermissionStatus Component
 * Shows current notification permission status (useful for settings page)
 */

export function NotificationPermissionStatus() {
  const { getNotificationPermission, isSupported } = usePushNotifications(null);
  const permission = getNotificationPermission();

  if (!isSupported) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm text-gray-600 dark:text-gray-400">
        Your browser doesn't support notifications
      </div>
    );
  }

  if (permission === "granted") {
    return (
      <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-green-800 dark:text-green-200">
        <Check className="h-4 w-4" />
        Notifications are enabled
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
        <BellOff className="h-4 w-4" />
        Notifications are disabled. Enable in browser settings to receive alerts.
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-200">
      Click the button above to enable notifications
    </div>
  );
}
