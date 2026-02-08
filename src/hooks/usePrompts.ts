import { useState, useCallback, useEffect } from "react";
import { getAllPrompts } from "@/lib/prompts";

interface ProfilePrompt {
  promptId: string;
  question: string;
  answer: string;
}

interface UsePromptsReturn {
  userPrompts: ProfilePrompt[];
  availablePrompts: typeof getAllPrompts extends () => infer R ? R : [];
  maxPrompts: number;
  isLoading: boolean;
  error: string | null;
  updatePrompts: (prompts: ProfilePrompt[]) => Promise<void>;
  removePrompt: (promptId: string) => Promise<void>;
}

export function usePrompts(): UsePromptsReturn {
  const [userPrompts, setUserPrompts] = useState<ProfilePrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's prompts
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/profiles/prompts");

        if (!response.ok) {
          throw new Error("Failed to fetch prompts");
        }

        const data = await response.json();
        setUserPrompts(data.userPrompts || []);
      } catch (err) {
        console.error("Error fetching prompts:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch prompts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  const updatePrompts = useCallback(async (prompts: ProfilePrompt[]) => {
    try {
      setError(null);
      const response = await fetch("/api/profiles/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompts }),
      });

      if (!response.ok) {
        throw new Error("Failed to update prompts");
      }

      const data = await response.json();
      setUserPrompts(data.prompts || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update prompts";
      setError(errorMsg);
      throw err;
    }
  }, []);

  const removePrompt = useCallback(async (promptId: string) => {
    try {
      setError(null);
      const response = await fetch(
        `/api/profiles/prompts?promptId=${encodeURIComponent(promptId)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete prompt");
      }

      const data = await response.json();
      setUserPrompts(data.prompts || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete prompt";
      setError(errorMsg);
      throw err;
    }
  }, []);

  return {
    userPrompts,
    availablePrompts: getAllPrompts(),
    maxPrompts: 5,
    isLoading,
    error,
    updatePrompts,
    removePrompt,
  };
}
