"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Ban } from "lucide-react";

interface BlockButtonProps {
  userId: string;
  userName?: string;
  isBlocked?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onBlockChange?: (blocked: boolean) => void;
}

export function BlockButton({
  userId,
  userName,
  isBlocked = false,
  variant = "outline",
  size = "default",
  className,
  onBlockChange,
}: BlockButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [blocked, setBlocked] = useState(isBlocked);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBlock = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blockedUserId: userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to block user");
      }

      setBlocked(true);
      onBlockChange?.(true);
      toast({
        title: "User blocked",
        description: `You have blocked ${userName || "this user"}. You won't see their content or receive messages from them.`,
      });
      router.refresh();
    } catch (error) {
      console.error("Error blocking user:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to block user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleUnblock = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/blocks/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to unblock user");
      }

      setBlocked(false);
      onBlockChange?.(false);
      toast({
        title: "User unblocked",
        description: `You have unblocked ${userName || "this user"}.`,
      });
      router.refresh();
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to unblock user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (blocked) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleUnblock}
        disabled={isLoading}
      >
        <Ban className="h-4 w-4 mr-2" />
        {isLoading ? "Unblocking..." : "Unblock"}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setShowConfirmDialog(true)}
        disabled={isLoading}
      >
        <Ban className="h-4 w-4 mr-2" />
        Block User
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {userName || "this user"}?</AlertDialogTitle>
            <AlertDialogDescription>
              Blocking will prevent this user from:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Sending you date requests</li>
                <li>Messaging you</li>
                <li>Viewing your profile</li>
              </ul>
              <p className="mt-2">
                You can unblock them at any time from your settings.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleBlock();
              }}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Blocking..." : "Block User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
