import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TwoFactorSettings } from "@/components/auth/two-factor-settings";

export default async function SecuritySettingsPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  // Fetch user's 2FA status
  const [user] = await db
    .select({ twoFactorEnabled: users.twoFactorEnabled })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const twoFactorEnabled = user?.twoFactorEnabled || false;

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Security Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account security and authentication settings
          </p>
        </div>
        <TwoFactorSettings isEnabled={twoFactorEnabled} />
      </div>
    </div>
  );
}
