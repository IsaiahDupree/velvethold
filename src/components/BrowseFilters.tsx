"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { SlidersHorizontal, X } from "lucide-react";

export function BrowseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [intent, setIntent] = useState<string>(searchParams.get("intent") || "all");
  const [city, setCity] = useState<string>(searchParams.get("city") || "");
  const [minAge, setMinAge] = useState<string>(searchParams.get("minAge") || "");
  const [maxAge, setMaxAge] = useState<string>(searchParams.get("maxAge") || "");
  const [isOpen, setIsOpen] = useState(false);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    // Preserve existing query param
    const query = searchParams.get("query");
    if (query) {
      params.set("query", query);
    }

    // Add filter params
    if (intent && intent !== "all") {
      params.set("intent", intent);
    }
    if (city) {
      params.set("city", city);
    }
    if (minAge) {
      params.set("minAge", minAge);
    }
    if (maxAge) {
      params.set("maxAge", maxAge);
    }

    // Navigate with new params
    router.push(`/browse?${params.toString()}`);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setIntent("all");
    setCity("");
    setMinAge("");
    setMaxAge("");

    // Keep query param if exists
    const query = searchParams.get("query");
    if (query) {
      router.push(`/browse?query=${query}`);
    } else {
      router.push("/browse");
    }
    setIsOpen(false);
  };

  // Count active filters
  const activeFilterCount = [
    intent !== "all",
    city,
    minAge,
    maxAge,
  ].filter(Boolean).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Profiles</SheetTitle>
          <SheetDescription>
            Refine your search to find the perfect match
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Intent Filter */}
          <div className="space-y-2">
            <Label htmlFor="intent">Looking for</Label>
            <Select value={intent} onValueChange={setIntent}>
              <SelectTrigger id="intent">
                <SelectValue placeholder="Select intent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="dating">Dating</SelectItem>
                <SelectItem value="relationship">Relationship</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* City Filter */}
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              type="text"
              placeholder="e.g., San Francisco"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          {/* Age Range Filter */}
          <div className="space-y-2">
            <Label>Age Range</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Min"
                min="18"
                max="100"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="Max"
                min="18"
                max="100"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="w-full sm:w-auto"
          >
            Clear All
          </Button>
          <SheetClose asChild>
            <Button
              onClick={handleApplyFilters}
              className="w-full sm:w-auto"
            >
              Apply Filters
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
