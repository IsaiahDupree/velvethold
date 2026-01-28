/**
 * Content moderation utilities for message safety
 */

// List of prohibited words/patterns for basic content filtering
// In production, this would be more sophisticated (e.g., using a third-party API)
const PROHIBITED_PATTERNS = [
  // Contact info patterns
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/i, // Phone numbers
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i, // Email addresses
  /\b(?:whatsapp|telegram|snapchat|instagram|facebook|twitter|kik)\b/i, // Social media handles request

  // Payment/transaction attempts
  /\b(?:venmo|paypal|cashapp|zelle|bitcoin|crypto)\b/i,
  /\b(?:send\s+(?:me\s+)?money|wire\s+transfer)\b/i,

  // Extreme profanity (basic list - would expand in production)
  /\b(?:fuck|shit|bitch|asshole|cunt|dick|pussy|cock)\b/i,
];

// Suspicious patterns that trigger warnings but don't block
const SUSPICIOUS_PATTERNS = [
  /\b(?:meet\s+(?:in\s+)?person|(?:my|your)\s+place|hotel\s+room)\b/i,
  /\b(?:off\s+(?:the\s+)?platform|leave\s+(?:this\s+)?(?:app|site))\b/i,
];

export interface ContentModerationResult {
  allowed: boolean;
  reason?: string;
  warning?: string;
  filteredContent?: string;
}

/**
 * Check if message content violates safety policies
 */
export function moderateContent(content: string): ContentModerationResult {
  // Check for prohibited patterns
  for (const pattern of PROHIBITED_PATTERNS) {
    if (pattern.test(content)) {
      return {
        allowed: false,
        reason: "Message contains prohibited content (contact info, profanity, or payment requests)",
      };
    }
  }

  // Check for suspicious patterns (allow but warn)
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      return {
        allowed: true,
        warning: "Please keep all communication on the platform for your safety",
      };
    }
  }

  return {
    allowed: true,
  };
}

/**
 * Filter profanity from content (replace with asterisks)
 */
export function filterProfanity(content: string): string {
  let filtered = content;

  // Basic profanity filter (replace with asterisks)
  const profanityList = [
    'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'cock'
  ];

  for (const word of profanityList) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  }

  return filtered;
}

/**
 * Check for spam/flooding indicators
 */
export function isSpam(content: string): boolean {
  // Check for excessive repetition
  const words = content.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);

  if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
    return true; // More than 70% repetition
  }

  // Check for excessive caps
  const capsCount = (content.match(/[A-Z]/g) || []).length;
  const letterCount = (content.match(/[A-Za-z]/g) || []).length;

  if (letterCount > 20 && capsCount / letterCount > 0.7) {
    return true; // More than 70% caps
  }

  // Check for excessive special characters
  const specialCount = (content.match(/[!@#$%^&*()]/g) || []).length;
  if (specialCount > 10) {
    return true;
  }

  return false;
}

/**
 * Rate limit checking (messages per minute)
 * This would typically be stored in Redis or similar
 */
const messageTimestamps = new Map<string, number[]>();

export function checkRateLimit(userId: string, maxPerMinute: number = 10): boolean {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  // Get user's recent timestamps
  const timestamps = messageTimestamps.get(userId) || [];

  // Filter to last minute
  const recentTimestamps = timestamps.filter(ts => ts > oneMinuteAgo);

  // Check if over limit
  if (recentTimestamps.length >= maxPerMinute) {
    return false; // Rate limit exceeded
  }

  // Add current timestamp
  recentTimestamps.push(now);
  messageTimestamps.set(userId, recentTimestamps);

  return true; // Within rate limit
}
