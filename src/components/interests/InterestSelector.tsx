"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ALL_INTERESTS, INTEREST_CATEGORIES } from "@/lib/interests";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";

interface InterestSelectorProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  maxInterests?: number;
  readOnly?: boolean;
}

export function InterestSelector({
  selectedInterests,
  onInterestsChange,
  maxInterests = 20,
  readOnly = false,
}: InterestSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(selectedInterests)
  );

  useEffect(() => {
    setSelected(new Set(selectedInterests));
  }, [selectedInterests]);

  const toggleInterest = (interest: string) => {
    if (readOnly) return;

    const newSelected = new Set(selected);
    if (newSelected.has(interest)) {
      newSelected.delete(interest);
    } else if (newSelected.size < maxInterests) {
      newSelected.add(interest);
    }

    setSelected(newSelected);
    onInterestsChange(Array.from(newSelected));
  };

  const removeInterest = (interest: string) => {
    if (readOnly) return;

    const newSelected = new Set(selected);
    newSelected.delete(interest);
    setSelected(newSelected);
    onInterestsChange(Array.from(newSelected));
  };

  if (readOnly) {
    return (
      <div className="space-y-3">
        <h3 className="font-medium text-sm">Interests</h3>
        <div className="flex flex-wrap gap-2">
          {selectedInterests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No interests added</p>
          ) : (
            selectedInterests.map((interest) => (
              <Badge key={interest} variant="secondary">
                {interest}
              </Badge>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-sm mb-2">
          Your Interests ({selected.size}/{maxInterests})
        </h3>
        <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border rounded-md bg-secondary/20">
          {selected.size === 0 ? (
            <p className="text-sm text-muted-foreground">
              Select interests below to add them here
            </p>
          ) : (
            Array.from(selected).map((interest) => (
              <Badge key={interest} variant="default" className="gap-1">
                {interest}
                <button
                  onClick={() => removeInterest(interest)}
                  className="ml-1 hover:opacity-70"
                >
                  <X size={14} />
                </button>
              </Badge>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-sm mb-2">Available Interests</h3>
        <Tabs defaultValue="sports" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            {Object.keys(INTEREST_CATEGORIES).map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="capitalize text-xs"
              >
                {category.replace("_", " ")}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(INTEREST_CATEGORIES).map(([category, interests]) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {interests.map((interest) => (
                  <Button
                    key={interest}
                    variant={selected.has(interest) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleInterest(interest)}
                    className="justify-start text-xs"
                    disabled={
                      selected.size >= maxInterests && !selected.has(interest)
                    }
                  >
                    {interest}
                  </Button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
