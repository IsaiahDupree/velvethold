import { requireAuth } from "@/lib/session";
import { searchProfiles } from "@/db/queries/profiles";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrowseFilters } from "@/components/BrowseFilters";
import { BrowseSearch } from "@/components/BrowseSearch";
import { BrowseClient } from "@/components/BrowseClient";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await requireAuth();
  const params = await searchParams;

  // Extract search parameters
  const query = typeof params.query === "string" ? params.query : undefined;
  const intentParam = typeof params.intent === "string" ? params.intent : undefined;
  const intent = (intentParam === "dating" || intentParam === "relationship" || intentParam === "friends")
    ? intentParam
    : undefined;
  const city = typeof params.city === "string" ? params.city : undefined;
  const minAge = typeof params.minAge === "string" ? parseInt(params.minAge) : undefined;
  const maxAge = typeof params.maxAge === "string" ? parseInt(params.maxAge) : undefined;
  const limit = typeof params.limit === "string" ? parseInt(params.limit) : 12;
  const offset = typeof params.offset === "string" ? parseInt(params.offset) : 0;

  // Fetch profiles (exclude current user and blocked users)
  const profiles = await searchProfiles({
    query,
    intent,
    city,
    minAge,
    maxAge,
    limit,
    offset,
    excludeUserId: session.user.id,
  });

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
          <h1 className="text-4xl font-bold mb-2">Browse Profiles</h1>
          <p className="text-muted-foreground">
            Discover matches who share your intentions and interests
          </p>
        </div>

        {/* Search and Filters Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <BrowseSearch />

            {/* Filters Button */}
            <BrowseFilters />
          </div>

          {/* Active Filters Display */}
          {(intent || city || minAge || maxAge) && (
            <div className="flex flex-wrap gap-2">
              {intent && (
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  Intent: {intent}
                </div>
              )}
              {city && (
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  City: {city}
                </div>
              )}
              {(minAge || maxAge) && (
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  Age: {minAge || 18}-{maxAge || "∞"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {profiles.length} initial {profiles.length === 1 ? "profile" : "profiles"}
          </p>
        </div>

        {/* Profiles Grid with Infinite Scroll */}
        <BrowseClient
          initialProfiles={profiles}
          filters={{
            query,
            intent,
            city,
            minAge,
            maxAge,
          }}
        />
      </div>
    </div>
  );
}
