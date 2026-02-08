// Common interest tags for VelvetHold users
export const INTEREST_CATEGORIES = {
  sports: ["Basketball", "Soccer", "Tennis", "Hiking", "Yoga", "Gym", "Running", "Cycling", "Volleyball", "Swimming"],
  arts: ["Painting", "Photography", "Music", "Writing", "Sculpture", "Dance", "Theater", "Film"],
  entertainment: ["Movies", "TV Shows", "Gaming", "Stand-up Comedy", "Concerts", "Art Gallery", "Museum"],
  food: ["Cooking", "Baking", "Wine Tasting", "Coffee", "Dining Out", "Farmers Market"],
  culture: ["Books", "Podcasts", "Documentaries", "Travel", "Languages", "History", "Philosophy"],
  social: ["Volunteering", "Community Events", "Networking", "Socializing", "Karaoke", "Parties"],
  outdoor: ["Hiking", "Camping", "Rock Climbing", "Beach", "Skiing", "Kayaking", "Fishing"],
  lifestyle: ["Meditation", "Wellness", "Fashion", "DIY", "Gardening", "Pet Lover", "Cooking"],
};

export type InterestCategory = keyof typeof INTEREST_CATEGORIES;

export const ALL_INTERESTS = Object.values(INTEREST_CATEGORIES).flat();

export interface InterestTag {
  name: string;
  category: InterestCategory;
}

/**
 * Validate that an interest tag exists in our predefined list
 */
export function isValidInterest(interest: string): boolean {
  return ALL_INTERESTS.includes(interest);
}

/**
 * Get category for an interest
 */
export function getInterestCategory(interest: string): InterestCategory | null {
  for (const [category, interests] of Object.entries(INTEREST_CATEGORIES)) {
    if (interests.includes(interest)) {
      return category as InterestCategory;
    }
  }
  return null;
}

/**
 * Validate array of interests
 */
export function validateInterests(interests: unknown[]): string[] {
  if (!Array.isArray(interests)) return [];

  return interests
    .filter(interest => typeof interest === "string")
    .filter(interest => isValidInterest(interest))
    .slice(0, 20); // Max 20 interests
}

/**
 * Calculate interest compatibility between two profiles (0-100)
 */
export function calculateInterestCompatibility(
  interests1: string[],
  interests2: string[]
): number {
  if (interests1.length === 0 || interests2.length === 0) return 0;

  const set1 = new Set(interests1);
  const set2 = new Set(interests2);

  // Count matching interests
  let matches = 0;
  for (const interest of set1) {
    if (set2.has(interest)) matches++;
  }

  // Calculate percentage of total unique interests
  const totalUnique = new Set([...set1, ...set2]).size;
  return Math.round((matches / totalUnique) * 100);
}

/**
 * Get recommended interests based on existing ones (for suggestions)
 */
export function getRecommendedInterests(
  currentInterests: string[],
  limit: number = 5
): string[] {
  const currentSet = new Set(currentInterests);
  const currentCategories = new Set(
    currentInterests.map(interest => getInterestCategory(interest))
  );

  // Recommend interests from same categories first
  const recommendations: string[] = [];

  for (const category of currentCategories) {
    if (!category) continue;
    const categoryInterests = INTEREST_CATEGORIES[category]
      .filter(interest => !currentSet.has(interest));
    recommendations.push(...categoryInterests);
  }

  // Then add interests from other categories
  const remainingInterests = ALL_INTERESTS.filter(
    interest => !currentSet.has(interest)
  );
  recommendations.push(
    ...remainingInterests.filter(
      interest => !recommendations.includes(interest)
    )
  );

  return recommendations.slice(0, limit);
}
