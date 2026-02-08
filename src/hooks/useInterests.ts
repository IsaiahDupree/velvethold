import { useState, useCallback, useEffect } from "react";
import { ALL_INTERESTS } from "@/lib/interests";

interface UseInterestsReturn {
  userInterests: string[];
  availableInterests: string[];
  maxInterests: number;
  isLoading: boolean;
  error: string | null;
  updateInterests: (interests: string[]) => Promise<void>;
}

export function useInterests(): UseInterestsReturn {
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's interests
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/profiles/interests");

        if (!response.ok) {
          throw new Error("Failed to fetch interests");
        }

        const data = await response.json();
        setUserInterests(data.userInterests || []);
      } catch (err) {
        console.error("Error fetching interests:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch interests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterests();
  }, []);

  const updateInterests = useCallback(async (interests: string[]) => {
    try {
      setError(null);
      const response = await fetch("/api/profiles/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests }),
      });

      if (!response.ok) {
        throw new Error("Failed to update interests");
      }

      const data = await response.json();
      setUserInterests(data.interests || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update interests";
      setError(errorMsg);
      throw err;
    }
  }, []);

  return {
    userInterests,
    availableInterests: ALL_INTERESTS,
    maxInterests: 20,
    isLoading,
    error,
    updateInterests,
  };
}
