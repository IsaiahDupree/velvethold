"use client";

import { useState, useCallback } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { NotificationList } from "./notification-list";
import { cn } from "@/lib/utils";

/**
 * NotificationBell Component
 * Displays notification bell icon with unread count and opens notification panel
 */

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleMarkAllAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:w-96">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between gap-4">
              <SheetTitle>Notifications</SheetTitle>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </SheetHeader>
          <NotificationList
            onUnreadCountChange={setUnreadCount}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
