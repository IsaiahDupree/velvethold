import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function SuspendedPage() {
  const session = await auth();

  // If not logged in or account is active, redirect
  if (!session?.user || session.user.accountStatus === "active") {
    redirect("/dashboard");
  }

  const accountStatus = session.user.accountStatus;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Account {accountStatus === "banned" ? "Banned" : "Suspended"}
          </h1>

          {accountStatus === "banned" ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Your account has been permanently banned due to violations of our community guidelines.
              </p>
              <p className="text-gray-600">
                If you believe this is an error, please contact our support team.
              </p>
            </div>
          ) : accountStatus === "suspended" ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Your account has been temporarily suspended due to reported violations.
              </p>
              <p className="text-gray-600">
                Please contact our support team for more information about your account status.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Your account has been flagged for review. Some features may be limited.
              </p>
              <p className="text-gray-600">
                Our team is reviewing your account. You may continue to use most features.
              </p>
            </div>
          )}

          <div className="mt-8">
            <form action="/api/auth/signout" method="POST">
              <Button type="submit" variant="outline" className="w-full">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
