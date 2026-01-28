"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettingsProps {
  user: any;
}

export function NotificationSettings({ user }: NotificationSettingsProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Default notification preferences (would come from DB in future)
  const [emailRequestReceived, setEmailRequestReceived] = useState(true);
  const [emailRequestApproved, setEmailRequestApproved] = useState(true);
  const [emailRequestDeclined, setEmailRequestDeclined] = useState(true);
  const [emailMessageReceived, setEmailMessageReceived] = useState(true);
  const [emailDateReminder, setEmailDateReminder] = useState(true);
  const [emailSecurityAlerts, setEmailSecurityAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [notificationFrequency, setNotificationFrequency] = useState("immediate");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailRequestReceived,
          emailRequestApproved,
          emailRequestDeclined,
          emailMessageReceived,
          emailDateReminder,
          emailSecurityAlerts,
          marketingEmails,
          notificationFrequency,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update preferences");
      }

      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Manage which email notifications you receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="request-received">Date Request Received</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone sends you a date request
              </p>
            </div>
            <Switch
              id="request-received"
              checked={emailRequestReceived}
              onCheckedChange={setEmailRequestReceived}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="request-approved">Date Request Approved</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when your date request is approved
              </p>
            </div>
            <Switch
              id="request-approved"
              checked={emailRequestApproved}
              onCheckedChange={setEmailRequestApproved}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="request-declined">Date Request Declined</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when your date request is declined
              </p>
            </div>
            <Switch
              id="request-declined"
              checked={emailRequestDeclined}
              onCheckedChange={setEmailRequestDeclined}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="message-received">New Messages</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you receive new chat messages
              </p>
            </div>
            <Switch
              id="message-received"
              checked={emailMessageReceived}
              onCheckedChange={setEmailMessageReceived}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="date-reminder">Date Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminders about upcoming confirmed dates
              </p>
            </div>
            <Switch
              id="date-reminder"
              checked={emailDateReminder}
              onCheckedChange={setEmailDateReminder}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Notification Frequency</Label>
            <Select value={notificationFrequency} onValueChange={setNotificationFrequency}>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate - Send right away</SelectItem>
                <SelectItem value="hourly">Hourly - Batch every hour</SelectItem>
                <SelectItem value="daily">Daily - Once per day digest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security & Account</CardTitle>
          <CardDescription>
            Important security and account notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="security-alerts">Security Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Password changes, 2FA updates, and new device logins
              </p>
            </div>
            <Switch
              id="security-alerts"
              checked={emailSecurityAlerts}
              onCheckedChange={setEmailSecurityAlerts}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            We recommend keeping security alerts enabled to protect your account
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Marketing & Updates</CardTitle>
          <CardDescription>
            Product updates, tips, and promotional content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Tips, new features, and special offers
              </p>
            </div>
            <Switch
              id="marketing"
              checked={marketingEmails}
              onCheckedChange={setMarketingEmails}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
