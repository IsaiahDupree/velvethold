"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TwoFactorSettings } from "@/components/auth/two-factor-settings";

interface AccountSettingsProps {
  user: any;
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const { toast } = useToast();
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingPhone, setIsChangingPhone] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState(user.phone || "");

  const handleEmailChange = async () => {
    if (!newEmail) {
      toast({
        title: "Error",
        description: "Please enter a new email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/account/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });

      if (!response.ok) {
        throw new Error("Failed to update email");
      }

      toast({
        title: "Verification email sent",
        description: "Please check your new email address to verify the change.",
      });
      setIsChangingEmail(false);
      setNewEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update password");
      }

      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      });
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePhoneUpdate = async () => {
    try {
      const response = await fetch("/api/account/phone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        throw new Error("Failed to update phone");
      }

      toast({
        title: "Phone updated",
        description: "Your phone number has been successfully updated.",
      });
      setIsChangingPhone(false);
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update phone. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Manage your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={user.name} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <div className="flex items-center gap-2">
              <Input value={user.email} disabled className="bg-muted flex-1" />
              <Badge variant={user.verificationStatus === "verified" ? "default" : "secondary"}>
                {user.verificationStatus === "verified" ? "Verified" : "Unverified"}
              </Badge>
            </div>
            {!isChangingEmail ? (
              <Button variant="outline" size="sm" onClick={() => setIsChangingEmail(true)}>
                Change Email
              </Button>
            ) : (
              <div className="space-y-2 pt-2">
                <Input
                  type="email"
                  placeholder="New email address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEmailChange}>
                    Send Verification
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    setIsChangingEmail(false);
                    setNewEmail("");
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex items-center gap-2">
              <Input
                value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                disabled
                className="bg-muted"
              />
              <Badge variant="secondary">
                {user.role === "both" ? "Invitee & Requester" : user.role}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Account Status</Label>
            <div className="flex items-center gap-2">
              <Badge variant={user.accountStatus === "active" ? "default" : "destructive"}>
                {user.accountStatus}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isChangingPassword ? (
            <Button onClick={() => setIsChangingPassword(true)}>Change Password</Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePasswordChange}>Update Password</Button>
                <Button variant="outline" onClick={() => {
                  setIsChangingPassword(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phone Number</CardTitle>
          <CardDescription>Used for two-factor authentication (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isChangingPhone ? (
            <div className="space-y-2">
              <Input value={user.phone || "No phone number"} disabled className="bg-muted" />
              <Button variant="outline" onClick={() => setIsChangingPhone(true)}>
                {user.phone ? "Update Phone" : "Add Phone"}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handlePhoneUpdate}>Save</Button>
                <Button variant="outline" onClick={() => {
                  setIsChangingPhone(false);
                  setPhone(user.phone || "");
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <TwoFactorSettings isEnabled={user.twoFactorEnabled} />
    </div>
  );
}
