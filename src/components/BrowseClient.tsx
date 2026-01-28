"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { ProfileCard } from "@/components/ProfileCard";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";

interface Profile {
  id: string;
  displayName: string;
  age: number;
  city: string;
  bio?: string | null;
  intent?: string | null;
  depositAmount?: number | null;
}

interface BrowseClientProps {
  initialProfiles: Profile[];
  filters: {
    query?: string;
    intent?: string;
    city?: string;
    minAge?: number;
    maxAge?: number;
  };
}

async function fetchProfiles({
  pageParam = 0,
  filters,
}: {
  pageParam?: number;
  filters: BrowseClientProps["filters"];
}) {
  const params = new URLSearchParams({
    limit: "12",
    offset: pageParam.toString(),
    ...(filters.query && { query: filters.query }),
    ...(filters.intent && { intent: filters.intent }),
    ...(filters.city && { city: filters.city }),
    ...(filters.minAge && { minAge: filters.minAge.toString() }),
    ...(filters.maxAge && { maxAge: filters.maxAge.toString() }),
  });

  const response = await fetch(`/api/profiles?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch profiles");
  }

  const data = await response.json();
  return {
    profiles: data.profiles as Profile[],
    nextOffset: data.profiles.length === 12 ? pageParam + 12 : undefined,
  };
}

export function BrowseClient({ initialProfiles, filters }: BrowseClientProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["profiles", filters],
      queryFn: ({ pageParam = 0 }) => fetchProfiles({ pageParam, filters }),
      getNextPageParam: (lastPage) => lastPage.nextOffset,
      initialPageParam: 0,
      initialData: {
        pages: [{ profiles: initialProfiles, nextOffset: initialProfiles.length === 12 ? 12 : undefined }],
        pageParams: [0],
      },
    });

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allProfiles = data?.pages.flatMap((page) => page.profiles) ?? [];

  if (allProfiles.length === 0 && !isLoading) {
    return (
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
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allProfiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="mt-8 flex justify-center">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading more profiles...
          </div>
        ) : hasNextPage ? (
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            Load More
          </Button>
        ) : allProfiles.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            No more profiles to load
          </p>
        ) : null}
      </div>
    </>
  );
}
