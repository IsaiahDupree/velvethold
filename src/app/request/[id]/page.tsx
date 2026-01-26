import { requireAuth } from "@/lib/session";
import { getProfileById } from "@/db/queries/profiles";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { RequestForm } from "@/components/RequestForm";

export default async function RequestDatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth();
  const { id } = await params;

  const profile = await getProfileById(id);

  if (!profile) {
    notFound();
  }

  if (profile.userId === session.user.id) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              VelvetHold
            </Link>
            <div className="flex gap-4 items-center">
              <Button variant="ghost" asChild>
                <Link href="/browse">Browse</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/api/auth/signout">Sign Out</Link>
              </Button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Cannot Request Your Own Profile</h1>
          <p className="text-muted-foreground mb-8">
            You cannot create a date request with yourself.
          </p>
          <Button asChild>
            <Link href="/browse">Browse Other Profiles</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            VelvetHold
          </Link>
          <div className="flex gap-4 items-center">
            <Button variant="ghost" asChild>
              <Link href={`/profiles/${id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/browse">Browse</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/api/auth/signout">Sign Out</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Request a Date</h1>
          <p className="text-muted-foreground">
            Send a date request to {profile.displayName}
          </p>
        </div>

        <RequestForm profile={profile} />
      </div>
    </div>
  );
}
