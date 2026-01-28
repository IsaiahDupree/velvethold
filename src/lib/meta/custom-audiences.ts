/**
 * Meta Custom Audiences API
 *
 * Manages custom audience membership for Meta ad targeting
 * Uses the Marketing API to add/remove users from custom audiences
 */

import crypto from "crypto";

/**
 * Hash user data for Meta custom audiences
 * Meta requires SHA-256 hashed and normalized data
 */
function hashUserData(value: string): string {
  // Normalize: lowercase and trim whitespace
  const normalized = value.toLowerCase().trim();
  // Hash with SHA-256
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Add users to a Meta custom audience
 */
export async function addToCustomAudience(
  audienceId: string,
  emails: string[]
): Promise<void> {
  if (!process.env.META_ACCESS_TOKEN) {
    throw new Error("META_ACCESS_TOKEN not configured");
  }

  // Hash all emails
  const hashedEmails = emails.map(hashUserData);

  // Create the payload
  const payload = {
    payload: {
      schema: ["EMAIL"],
      data: hashedEmails.map((hash) => [hash]),
    },
  };

  // Send to Meta API
  const url = `https://graph.facebook.com/v18.0/${audienceId}/users`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      access_token: process.env.META_ACCESS_TOKEN,
      ...payload,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to add to custom audience: ${JSON.stringify(error)}`);
  }
}

/**
 * Remove users from a Meta custom audience
 */
export async function removeFromCustomAudience(
  audienceId: string,
  emails: string[]
): Promise<void> {
  if (!process.env.META_ACCESS_TOKEN) {
    throw new Error("META_ACCESS_TOKEN not configured");
  }

  // Hash all emails
  const hashedEmails = emails.map(hashUserData);

  // Create the payload
  const payload = {
    payload: {
      schema: ["EMAIL"],
      data: hashedEmails.map((hash) => [hash]),
      is_removal: true, // This marks the operation as removal
    },
  };

  // Send to Meta API
  const url = `https://graph.facebook.com/v18.0/${audienceId}/users`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      access_token: process.env.META_ACCESS_TOKEN,
      ...payload,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to remove from custom audience: ${JSON.stringify(error)}`);
  }
}

/**
 * Create a new custom audience
 */
export async function createCustomAudience(
  adAccountId: string,
  name: string,
  description?: string
): Promise<{ id: string }> {
  if (!process.env.META_ACCESS_TOKEN) {
    throw new Error("META_ACCESS_TOKEN not configured");
  }

  const url = `https://graph.facebook.com/v18.0/act_${adAccountId}/customaudiences`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      access_token: process.env.META_ACCESS_TOKEN,
      name,
      description,
      subtype: "CUSTOM",
      customer_file_source: "USER_PROVIDED_ONLY",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create custom audience: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Get custom audience details
 */
export async function getCustomAudience(audienceId: string): Promise<{
  id: string;
  name: string;
  approximate_count: number;
}> {
  if (!process.env.META_ACCESS_TOKEN) {
    throw new Error("META_ACCESS_TOKEN not configured");
  }

  const url = `https://graph.facebook.com/v18.0/${audienceId}?fields=id,name,approximate_count&access_token=${process.env.META_ACCESS_TOKEN}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get custom audience: ${JSON.stringify(error)}`);
  }

  return response.json();
}
