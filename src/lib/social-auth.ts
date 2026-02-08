/**
 * Social Authentication Configuration
 * Supports OAuth providers: Google, Apple, Facebook
 */

export const socialProviders = {
  google: {
    id: "google",
    name: "Google",
    icon: "google",
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  },
  apple: {
    id: "apple",
    name: "Apple",
    icon: "apple",
    clientId: process.env.APPLE_CLIENT_ID || "",
    teamId: process.env.APPLE_TEAM_ID || "",
    keyId: process.env.APPLE_KEY_ID || "",
    privateKey: process.env.APPLE_PRIVATE_KEY || "",
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    icon: "facebook",
    clientId: process.env.FACEBOOK_CLIENT_ID || "",
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
  },
} as const;

export type SocialProvider = keyof typeof socialProviders;

/**
 * Get enabled social providers based on env variables
 */
export function getEnabledProviders(): SocialProvider[] {
  const enabled: SocialProvider[] = [];

  if (socialProviders.google.clientId && socialProviders.google.clientSecret) {
    enabled.push("google");
  }

  if (socialProviders.apple.clientId && socialProviders.apple.teamId) {
    enabled.push("apple");
  }

  if (socialProviders.facebook.clientId && socialProviders.facebook.clientSecret) {
    enabled.push("facebook");
  }

  return enabled;
}

/**
 * Map social provider user data to app user structure
 */
export function mapSocialUserData(
  provider: SocialProvider,
  userData: Record<string, any>
): {
  email: string;
  name: string;
  image?: string;
} {
  switch (provider) {
    case "google":
      return {
        email: userData.email,
        name: userData.name,
        image: userData.picture,
      };

    case "apple":
      return {
        email: userData.email,
        name: userData.name || `${userData.user?.name?.firstName || ""} ${userData.user?.name?.lastName || ""}`.trim(),
        image: undefined, // Apple doesn't provide profile picture
      };

    case "facebook":
      return {
        email: userData.email,
        name: userData.name,
        image: userData.picture?.data?.url,
      };

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * Social auth provider descriptions for UI
 */
export const providerDescriptions: Record<SocialProvider, string> = {
  google: "Sign in with your Google account",
  apple: "Sign in with your Apple account",
  facebook: "Sign in with your Facebook account",
};
