import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, profiles, blocks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export default async function SettingsPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  // Fetch user data
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    redirect("/auth/signin");
  }

  // Fetch profile data
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);

  // Fetch blocked users count
  const blockedUsers = await db
    .select()
    .from(blocks)
    .where(eq(blocks.blockerId, session.user.id));

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-primary">
            VelvetHold
          </a>
          <div className="flex gap-4 items-center">
            <a href="/browse" className="text-sm hover:text-primary">
              Browse
            </a>
            <a href="/inbox" className="text-sm hover:text-primary">
              Inbox
            </a>
            <a href="/dashboard" className="text-sm hover:text-primary">
              Dashboard
            </a>
            <a href="/settings" className="text-sm font-medium text-primary">
              Settings
            </a>
          </div>
        </div>
      </nav>

      <div className="container max-w-5xl py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account, profile, and preferences
            </p>
          </div>

          <SettingsTabs
            user={user}
            profile={profile}
            blockedUsersCount={blockedUsers.length}
          />
        </div>
      </div>
    </div>
  );
}
