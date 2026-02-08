// Curated profile prompts for VelvetHold users
export const PROFILE_PROMPTS = [
  {
    id: "prompt_1",
    question: "What's your idea of a perfect first date?",
    category: "dating",
  },
  {
    id: "prompt_2",
    question: "What are you looking for in a connection?",
    category: "dating",
  },
  {
    id: "prompt_3",
    question: "Why would you like to meet me specifically?",
    category: "dating",
  },
  {
    id: "prompt_4",
    question: "What's something on your bucket list?",
    category: "lifestyle",
  },
  {
    id: "prompt_5",
    question: "What's your hidden talent?",
    category: "personality",
  },
  {
    id: "prompt_6",
    question: "What's the best advice you've ever received?",
    category: "personality",
  },
  {
    id: "prompt_7",
    question: "If you could have dinner with anyone, who would it be?",
    category: "personality",
  },
  {
    id: "prompt_8",
    question: "What's your go-to weekend activity?",
    category: "lifestyle",
  },
  {
    id: "prompt_9",
    question: "What's a movie/show that changed your perspective?",
    category: "culture",
  },
  {
    id: "prompt_10",
    question: "Tell me about a time you took a risk",
    category: "personality",
  },
];

export interface ProfilePrompt {
  promptId: string;
  question: string;
  answer: string;
  category: string;
}

/**
 * Get a prompt by its ID
 */
export function getPromptById(promptId: string) {
  return PROFILE_PROMPTS.find((p) => p.id === promptId);
}

/**
 * Get prompts by category
 */
export function getPromptsByCategory(category: string) {
  return PROFILE_PROMPTS.filter((p) => p.category === category);
}

/**
 * Get all available prompts
 */
export function getAllPrompts() {
  return PROFILE_PROMPTS;
}

/**
 * Get unique categories
 */
export function getPromptCategories() {
  return Array.from(new Set(PROFILE_PROMPTS.map((p) => p.category)));
}

/**
 * Validate profile prompts answer
 */
export function validateProfilePrompts(prompts: unknown[]): ProfilePrompt[] {
  if (!Array.isArray(prompts)) return [];

  return prompts
    .filter((p) => {
      if (typeof p !== "object" || !p) return false;
      const obj = p as Record<string, any>;
      return (
        typeof obj.promptId === "string" &&
        typeof obj.answer === "string" &&
        obj.answer.length >= 10 &&
        obj.answer.length <= 500
      );
    })
    .slice(0, 5) // Max 5 prompts
    .map((p) => {
      const obj = p as Record<string, any>;
      const prompt = getPromptById(obj.promptId);
      return {
        promptId: obj.promptId,
        answer: obj.answer.trim(),
        question: prompt?.question || "",
        category: prompt?.category || "",
      };
    });
}

/**
 * Get recommended prompts based on profile interests
 */
export function getRecommendedPrompts(
  answeredPromptIds: string[] = [],
  limit: number = 3
): typeof PROFILE_PROMPTS {
  const unanswered = PROFILE_PROMPTS.filter(
    (p) => !answeredPromptIds.includes(p.id)
  );

  // Prioritize dating and personality categories
  const prioritized = unanswered.sort((a, b) => {
    const aScore =
      a.category === "dating"
        ? 3
        : a.category === "personality"
          ? 2
          : a.category === "lifestyle"
            ? 1
            : 0;
    const bScore =
      b.category === "dating"
        ? 3
        : b.category === "personality"
          ? 2
          : b.category === "lifestyle"
            ? 1
            : 0;
    return bScore - aScore;
  });

  return prioritized.slice(0, limit);
}
