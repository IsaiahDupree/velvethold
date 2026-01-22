import { requireAuth } from "@/lib/session";
import { getProfileById } from "@/db/queries/profiles";
import { ProfileDetail } from "@/components/ProfileDetail";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth();
  const { id } = await params;

  // Fetch the profile
  const profile = await getProfileById(id);

  if (!profile) {
    notFound();
  }

  // Check if this is the current user's profile
  const isOwnProfile = profile.userId === session.user.id;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            VelvetHold
          </Link>
          <div className="flex gap-4 items-center">
            <Button variant="ghost" asChild>
              <Link href="/browse">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Browse
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/inbox">Inbox</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/api/auth/signout">Sign Out</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Profile Details</h1>
          <p className="text-muted-foreground">
            {isOwnProfile
              ? "This is your profile as others see it"
              : "View complete profile information"}
          </p>
        </div>

        {/* Profile Detail Component */}
        <ProfileDetail
          profile={profile}
          showRequestButton={!isOwnProfile}
          onRequestDate={undefined}
        />

        {/* Additional Actions */}
        {!isOwnProfile && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href={`/request/${id}`}>Request a Date</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/browse">Continue Browsing</Link>
              </Button>
            </div>
          </div>
        )}

        {isOwnProfile && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/settings/profile">Edit Profile</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
