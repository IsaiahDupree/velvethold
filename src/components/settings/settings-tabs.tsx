"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "./profile-settings";
import { AccountSettings } from "./account-settings";
import { NotificationSettings } from "./notification-settings";
import { PrivacySettings } from "./privacy-settings";

interface SettingsTabsProps {
  user: any;
  profile: any;
  blockedUsersCount: number;
}

export function SettingsTabs({ user, profile, blockedUsersCount }: SettingsTabsProps) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-8">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-4">
        <ProfileSettings user={user} profile={profile} />
      </TabsContent>

      <TabsContent value="account" className="space-y-4">
        <AccountSettings user={user} />
      </TabsContent>

      <TabsContent value="notifications" className="space-y-4">
        <NotificationSettings user={user} />
      </TabsContent>

      <TabsContent value="privacy" className="space-y-4">
        <PrivacySettings user={user} blockedUsersCount={blockedUsersCount} />
      </TabsContent>
    </Tabs>
  );
}
