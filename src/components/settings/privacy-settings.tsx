"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PrivacySettingsProps {
  user: any;
  blockedUsersCount: number;
}

export function PrivacySettings({ user, blockedUsersCount }: PrivacySettingsProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDataDownload = async () => {
    toast({
      title: "Preparing your data",
      description: "Your data export will be sent to your email shortly.",
    });

    try {
      const response = await fetch("/api/account/export", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      toast({
        title: "Export started",
        description: "You'll receive an email with your data within 24 hours.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAccountDeletion = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });

      // Redirect to homepage after deletion
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Blocked Users</CardTitle>
          <CardDescription>
            Manage users you've blocked from contacting you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Blocked users</p>
              <p className="text-sm text-muted-foreground">
                You have blocked {blockedUsersCount} {blockedUsersCount === 1 ? "user" : "users"}
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href="/blocked-users">Manage Blocks</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Visibility</CardTitle>
          <CardDescription>
            Control who can see your profile and contact you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Verification Status</p>
                <p className="text-sm text-muted-foreground">
                  Verified users are more visible in search
                </p>
              </div>
              <Badge variant={user.verificationStatus === "verified" ? "default" : "secondary"}>
                {user.verificationStatus}
              </Badge>
            </div>
            {user.verificationStatus !== "verified" && (
              <Button variant="outline" asChild>
                <a href="/verification">Get Verified</a>
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Profile Settings</p>
              <p className="text-sm text-muted-foreground">
                Manage who can view your availability
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href="/settings?tab=profile">Edit Privacy</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>
            Manage your personal data and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div>
              <p className="font-medium">Download Your Data</p>
              <p className="text-sm text-muted-foreground">
                Get a copy of your profile, messages, and activity
              </p>
            </div>
            <Button variant="outline" onClick={handleDataDownload}>
              Request Data Export
            </Button>
          </div>

          <div className="space-y-2">
            <div>
              <p className="font-medium">Privacy Policy</p>
              <p className="text-sm text-muted-foreground">
                Learn how we handle your data
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href="/privacy" target="_blank">
                View Privacy Policy
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that will permanently affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Your profile and photos</li>
                      <li>All messages and chat history</li>
                      <li>Date requests and history</li>
                      <li>Payment and transaction records</li>
                    </ul>
                    <p className="mt-2 font-semibold">
                      Any pending deposits will be refunded within 5-7 business days.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleAccountDeletion}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
