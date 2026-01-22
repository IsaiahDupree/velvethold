import { requireAuth } from "@/lib/session";
import { searchProfiles } from "@/db/queries/profiles";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Heart, Search, SlidersHorizontal } from "lucide-react";

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

  // Fetch profiles
  const profiles = await searchProfiles({
    query,
    intent,
    city,
    minAge,
    maxAge,
    limit,
    offset,
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
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, interests, or location..."
                className="pl-10"
                defaultValue={query}
              />
            </div>

            {/* Filters Button */}
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
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
            Showing {profiles.length} {profiles.length === 1 ? "profile" : "profiles"}
          </p>
        </div>

        {/* Profiles Grid */}
        {profiles.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No profiles found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search filters to see more results
            </p>
            <Button asChild>
              <Link href="/browse">Clear Filters</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card
                key={profile.id}
                className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
              >
                <CardHeader className="pb-4">
                  {/* Profile Avatar Placeholder */}
                  <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-6xl font-bold text-primary/40">
                      {profile.displayName.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <CardTitle className="text-xl">
                    {profile.displayName}, {profile.age}
                  </CardTitle>

                  <CardDescription className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      {profile.city}
                    </div>
                    {profile.intent && (
                      <div className="flex items-center gap-2 text-sm">
                        <Heart className="h-4 w-4" />
                        {profile.intent.charAt(0).toUpperCase() + profile.intent.slice(1)}
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {profile.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {profile.bio}
                    </p>
                  )}

                  {profile.depositAmount && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        Deposit Amount
                      </span>
                      <span className="font-semibold">
                        ${(profile.depositAmount / 100).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <Button className="w-full" asChild>
                    <Link href={`/profiles/${profile.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {profiles.length >= limit && (
          <div className="mt-8 flex justify-center gap-2">
            {offset > 0 && (
              <Button variant="outline" asChild>
                <Link
                  href={`/browse?${new URLSearchParams({
                    ...(query && { query }),
                    ...(intent && { intent }),
                    ...(city && { city }),
                    ...(minAge && { minAge: minAge.toString() }),
                    ...(maxAge && { maxAge: maxAge.toString() }),
                    limit: limit.toString(),
                    offset: Math.max(0, offset - limit).toString(),
                  }).toString()}`}
                >
                  Previous
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link
                href={`/browse?${new URLSearchParams({
                  ...(query && { query }),
                  ...(intent && { intent }),
                  ...(city && { city }),
                  ...(minAge && { minAge: minAge.toString() }),
                  ...(maxAge && { maxAge: maxAge.toString() }),
                  limit: limit.toString(),
                  offset: (offset + limit).toString(),
                }).toString()}`}
              >
                Next
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
