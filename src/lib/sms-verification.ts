/**
 * SMS Verification System
 * Handles phone number verification for additional identity confirmation
 */

export interface SMSVerificationSession {
  id: string;
  userId: string;
  phoneNumber: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
  createdAt: Date;
}

export interface PhotoVerificationSession {
  id: string;
  userId: string;
  status: "pending" | "approved" | "rejected";
  selfieUrl: string;
  profilePhotoUrls: string[];
  verifiedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
}

export interface DateLocationSuggestion {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: "restaurant" | "cafe" | "activity" | "park" | "museum" | "bar";
  rating?: number;
  priceLevel?: "$" | "$$" | "$$$" | "$$$$";
  distance?: number; // in miles
  openNow?: boolean;
}

/**
 * Generate a random SMS verification code
 */
export function generateSMSCode(length: number = 6): string {
  const digits = "0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return code;
}

/**
 * Validate SMS code format
 */
export function validateSMSCode(code: string, expectedLength: number = 6): boolean {
  return /^\d+$/.test(code) && code.length === expectedLength;
}

/**
 * Calculate SMS code expiration (10 minutes from now)
 */
export function calculateSMSExpiration(fromDate: Date = new Date()): Date {
  const expiresAt = new Date(fromDate);
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);
  return expiresAt;
}

/**
 * Check if SMS code has expired
 */
export function isSMSCodeExpired(expiresAt: Date): boolean {
  return new Date() > new Date(expiresAt);
}

/**
 * Check if SMS verification is locked (too many attempts)
 */
export function isSMSVerificationLocked(attempts: number, maxAttempts: number = 5): boolean {
  return attempts >= maxAttempts;
}

/**
 * Format phone number to E.164 format for SMS provider
 */
export function formatPhoneNumberE164(
  phoneNumber: string,
  countryCode: string = "US"
): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  if (countryCode === "US" || countryCode === "CA") {
    // North America
    if (cleaned.length === 10) {
      return "+1" + cleaned;
    }
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return "+" + cleaned;
    }
  }

  // Default: prepend +
  return "+" + cleaned;
}

/**
 * Validate E.164 phone number
 */
export function validatePhoneNumberE164(phoneNumber: string): boolean {
  return /^\+[1-9]\d{1,14}$/.test(phoneNumber);
}

/**
 * Photo verification AI providers
 */
export const photoVerificationProviders = {
  microsoft: {
    name: "Microsoft Face API",
    description: "Face detection and comparison for selfie verification",
  },
  aws: {
    name: "AWS Rekognition",
    description: "Face matching and liveness detection",
  },
  twilio: {
    name: "Twilio Authy",
    description: "Photo verification with liveness detection",
  },
};

/**
 * Validate selfie and profile photos match (placeholder)
 */
export async function verifyPhotoMatch(
  selfieUrl: string,
  profilePhotoUrls: string[]
): Promise<{
  isMatch: boolean;
  confidence: number;
  details: string;
}> {
  // This would typically call an AI service like Microsoft Face API, AWS Rekognition, etc.
  // For now, returning placeholder response
  return {
    isMatch: true,
    confidence: 0.95,
    details: "Face match verification passed",
  };
}

/**
 * Date location suggestion categories with typical examples
 */
export const locationCategories = {
  restaurant: {
    name: "Restaurants",
    icon: "utensils",
    examples: ["Italian", "Japanese", "French", "Farm-to-Table"],
  },
  cafe: {
    name: "Cafes & Coffee",
    icon: "coffee",
    examples: ["Coffee Shop", "Tea House", "Brunch Spot"],
  },
  activity: {
    name: "Activities",
    icon: "star",
    examples: ["Bowling", "Mini Golf", "Escape Room", "Karaoke"],
  },
  park: {
    name: "Parks & Outdoor",
    icon: "trees",
    examples: ["Park", "Beach", "Hiking Trail", "Picnic Area"],
  },
  museum: {
    name: "Culture & Arts",
    icon: "palette",
    examples: ["Museum", "Art Gallery", "Theater", "Concert Hall"],
  },
  bar: {
    name: "Bars & Nightlife",
    icon: "wine-glass",
    examples: ["Wine Bar", "Cocktail Bar", "Rooftop Bar", "Brewery"],
  },
};

/**
 * Get location suggestions near coordinates
 * (Would integrate with Google Places API, Yelp, etc.)
 */
export async function getDateLocationSuggestions(
  latitude: number,
  longitude: number,
  categories?: string[],
  radiusMiles: number = 3
): Promise<DateLocationSuggestion[]> {
  // This would typically call Google Places API, Yelp API, or similar
  // Returning placeholder suggestions
  const suggestions: DateLocationSuggestion[] = [
    {
      id: "loc-1",
      name: "The Italian Place",
      address: "123 Main St, San Francisco, CA",
      latitude: latitude + 0.01,
      longitude: longitude + 0.01,
      category: "restaurant",
      rating: 4.5,
      priceLevel: "$$",
      distance: 0.5,
      openNow: true,
    },
    {
      id: "loc-2",
      name: "Morning Brew Cafe",
      address: "456 Park Ave, San Francisco, CA",
      latitude: latitude - 0.01,
      longitude: longitude - 0.01,
      category: "cafe",
      rating: 4.3,
      priceLevel: "$",
      distance: 0.8,
      openNow: true,
    },
  ];

  return suggestions.filter((s) => !categories || categories.includes(s.category));
}
