/**
 * PostHog Identity Sync
 *
 * Client component that syncs the authenticated user's identity to PostHog
 */

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { identifyPostHogUser } from "@/lib/posthog";

export function PostHogIdentitySync() {
  const { data: session, status } = useSession();
  const [hasIdentified, setHasIdentified] = useState(false);

  useEffect(() => {
    // Only identify once per session
    if (hasIdentified || status !== "authenticated" || !session?.user) {
      return;
    }

    // Fetch person ID and identify in PostHog
    async function identifyUser() {
      try {
        if (!session?.user) return;

        const response = await fetch("/api/growth/identity/me");
        if (!response.ok) {
          console.error("Failed to fetch person ID");
          return;
        }

        const data = await response.json();
        const { personId } = data;

        if (personId && session.user) {
          // Identify user in PostHog with canonical person ID
          const posthogDistinctId = identifyPostHogUser(personId, {
            email: session.user.email,
            name: session.user.name,
            role: session.user.role,
            verificationStatus: session.user.verificationStatus,
            accountStatus: session.user.accountStatus,
          });

          // Link PostHog distinct_id to person (optional - for tracking purposes)
          if (posthogDistinctId) {
            await fetch("/api/growth/identity/link", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                personId,
                provider: "posthog",
                externalId: posthogDistinctId,
              }),
            }).catch((err) => {
              console.error("Failed to link PostHog identity:", err);
            });
          }

          setHasIdentified(true);
        }
      } catch (error) {
        console.error("Error identifying user in PostHog:", error);
      }
    }

    identifyUser();
  }, [session, status, hasIdentified]);

  // This is a utility component that doesn't render anything
  return null;
}
