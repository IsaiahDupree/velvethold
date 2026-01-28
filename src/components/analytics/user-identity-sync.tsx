/**
 * User Identity Sync
 *
 * Client component that identifies authenticated users with our analytics system
 * Implements TRACK-008: User Identification
 */

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { identify } from "@/lib/growth/analytics";

export function UserIdentitySync() {
  const { data: session, status } = useSession();
  const [hasIdentified, setHasIdentified] = useState(false);

  useEffect(() => {
    // Only identify once per session
    if (hasIdentified || status !== "authenticated" || !session?.user) {
      return;
    }

    // Identify user with traits
    async function identifyUser() {
      try {
        if (!session?.user?.id) return;

        // Identify user with traits
        await identify(session.user.id, {
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
          verificationStatus: session.user.verificationStatus,
          accountStatus: session.user.accountStatus,
        });

        setHasIdentified(true);
      } catch (error) {
        console.error("Error identifying user:", error);
      }
    }

    identifyUser();
  }, [session, status, hasIdentified]);

  // This is a utility component that doesn't render anything
  return null;
}
