"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { getEnabledProviders, SocialProvider, providerDescriptions } from "@/lib/social-auth";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface SocialLoginButtonsProps {
  callbackUrl?: string;
  isSignUp?: boolean;
}

/**
 * SocialLoginButtons Component
 * Displays social login buttons for enabled providers
 */
export function SocialLoginButtons({
  callbackUrl = "/dashboard",
  isSignUp = false,
}: SocialLoginButtonsProps) {
  const enabledProviders = getEnabledProviders();
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);

  if (enabledProviders.length === 0) {
    return null;
  }

  const handleSignIn = async (provider: SocialProvider) => {
    setLoadingProvider(provider);
    try {
      await signIn(provider, { callbackUrl, redirect: true });
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Divider */}
      {enabledProviders.length > 0 && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-950 text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>
      )}

      {/* Social buttons */}
      <div className="grid grid-cols-3 gap-3">
        {enabledProviders.includes("google") && (
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSignIn("google")}
            disabled={loadingProvider !== null}
            title={providerDescriptions.google}
            className="w-full"
          >
            {loadingProvider === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.91 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
              </>
            )}
            <span className="sr-only">Google</span>
          </Button>
        )}

        {enabledProviders.includes("apple") && (
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSignIn("apple")}
            disabled={loadingProvider !== null}
            title={providerDescriptions.apple}
            className="w-full"
          >
            {loadingProvider === "apple" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <svg
                  className="h-4 w-4 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8.905-.15 1.77-.76 2.84-.65 1.51.13 2.78.72 3.54 1.86-3.3 2.05-2.82 6.43.6 7.95-.53 1.5-1.25 2.06-2.56 2.81l-.04-.01z" />
                </svg>
              </>
            )}
            <span className="sr-only">Apple</span>
          </Button>
        )}

        {enabledProviders.includes("facebook") && (
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSignIn("facebook")}
            disabled={loadingProvider !== null}
            title={providerDescriptions.facebook}
            className="w-full"
          >
            {loadingProvider === "facebook" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <svg
                  className="h-4 w-4 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </>
            )}
            <span className="sr-only">Facebook</span>
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * SocialLoginLink Component
 * Single provider button variant
 */
interface SocialLoginLinkProps {
  provider: SocialProvider;
  fullWidth?: boolean;
  callbackUrl?: string;
}

export function SocialLoginLink({
  provider,
  fullWidth = false,
  callbackUrl = "/dashboard",
}: SocialLoginLinkProps) {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signIn(provider, { callbackUrl, redirect: true });
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={loading}
      className={fullWidth ? "w-full" : ""}
      variant="default"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : null}
      Sign in with {provider.charAt(0).toUpperCase() + provider.slice(1)}
    </Button>
  );
}
