/**
 * Premium Features Module
 * Handles profile boosts, premium subscriptions, and referral system
 */

export enum BoostDuration {
  ONE_HOUR = 1,
  SIX_HOURS = 6,
  ONE_DAY = 24,
  ONE_WEEK = 168,
}

export interface ProfileBoost {
  id: string;
  userId: string;
  duration: BoostDuration;
  startedAt: Date;
  expiresAt: Date;
  visibility: "featured" | "highlighted" | "priority";
  cost: number; // In cents
}

export interface ReferralReward {
  id: string;
  referrerId: string;
  referredUserId: string;
  status: "pending" | "completed" | "expired";
  rewardType: "credit" | "premium_days" | "deposit_waiver";
  rewardAmount: number | string;
  createdAt: Date;
  completedAt?: Date;
  expiresAt: Date;
}

export interface BoostOption {
  duration: BoostDuration;
  visibility: "featured" | "highlighted" | "priority";
  cost: number;
  name: string;
  description: string;
}

/**
 * Available profile boost options
 */
export const boostOptions: BoostOption[] = [
  {
    duration: BoostDuration.ONE_HOUR,
    visibility: "priority",
    cost: 299, // $2.99
    name: "Quick Boost",
    description: "Get visibility boost for 1 hour",
  },
  {
    duration: BoostDuration.SIX_HOURS,
    visibility: "highlighted",
    cost: 799, // $7.99
    name: "Standard Boost",
    description: "Highlighted profile for 6 hours",
  },
  {
    duration: BoostDuration.ONE_DAY,
    visibility: "highlighted",
    cost: 1499, // $14.99
    name: "Day Boost",
    description: "Full day of increased visibility",
  },
  {
    duration: BoostDuration.ONE_WEEK,
    visibility: "featured",
    cost: 4999, // $49.99
    name: "Weekly Featured",
    description: "Featured profile for 7 days",
  },
];

/**
 * Referral program tiers
 */
export const referralTiers = {
  bronze: {
    name: "Bronze",
    referralsNeeded: 1,
    reward: { type: "credit", amount: 500 }, // $5 credit
  },
  silver: {
    name: "Silver",
    referralsNeeded: 5,
    reward: { type: "premium_days", amount: 7 }, // 7 days premium
  },
  gold: {
    name: "Gold",
    referralsNeeded: 10,
    reward: { type: "premium_days", amount: 30 }, // 30 days premium
  },
  platinum: {
    name: "Platinum",
    referralsNeeded: 25,
    reward: { type: "deposit_waiver", amount: "unlimited" }, // Unlimited deposit waiver for a month
  },
};

/**
 * Calculate boost cost and expiration
 */
export function calculateBoostExpiration(
  duration: BoostDuration,
  startDate: Date = new Date()
): {
  expiresAt: Date;
  durationHours: number;
} {
  const expiresAt = new Date(startDate);
  expiresAt.setHours(expiresAt.getHours() + duration);

  return {
    expiresAt,
    durationHours: duration,
  };
}

/**
 * Get boost option by duration
 */
export function getBoostOption(duration: BoostDuration): BoostOption | undefined {
  return boostOptions.find((o) => o.duration === duration);
}

/**
 * Check if a boost is active
 */
export function isBoostActive(boost: ProfileBoost): boolean {
  return new Date() < new Date(boost.expiresAt);
}

/**
 * Generate referral code
 */
export function generateReferralCode(userId: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const userIdPart = userId.substring(0, 4).toUpperCase();
  return `VH${userIdPart}${timestamp}`;
}

/**
 * Validate referral code format
 */
export function validateReferralCode(code: string): boolean {
  return /^VH[A-Z0-9]{10,}$/.test(code);
}

/**
 * Get user's current referral tier
 */
export function getReferralTier(completedReferrals: number): string {
  if (completedReferrals >= 25) return "platinum";
  if (completedReferrals >= 10) return "gold";
  if (completedReferrals >= 5) return "silver";
  return "bronze";
}

/**
 * Video profile clips configuration
 */
export const videoProfileConfig = {
  maxDuration: 30, // seconds
  maxFileSize: 50 * 1024 * 1024, // 50MB
  acceptedFormats: ["video/mp4", "video/quicktime", "video/x-msvideo"],
  maxClips: 3,
};

/**
 * Validate video profile clip
 */
export function validateVideoClip(
  file: File,
  durationSeconds?: number
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > videoProfileConfig.maxFileSize) {
    return {
      valid: false,
      error: `File size must be less than ${videoProfileConfig.maxFileSize / (1024 * 1024)}MB`,
    };
  }

  // Check file type
  if (!videoProfileConfig.acceptedFormats.includes(file.type)) {
    return {
      valid: false,
      error: "File format must be MP4, MOV, or AVI",
    };
  }

  // Check duration
  if (durationSeconds && durationSeconds > videoProfileConfig.maxDuration) {
    return {
      valid: false,
      error: `Video must be ${videoProfileConfig.maxDuration} seconds or less`,
    };
  }

  return { valid: true };
}
