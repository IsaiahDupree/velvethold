/**
 * Identity Service
 *
 * Manages unified identity across platforms (app, PostHog, Stripe, Meta)
 * Provides identity stitching and resolution for the Growth Data Plane
 */

import { db } from "@/db";
import { users } from "@/db/schema";
import {
  createPerson,
  getPersonByEmail,
  createIdentityLink,
  findPersonByExternalId,
  getIdentityLinksByPerson,
  updatePerson,
} from "@/db/queries/growth-data-plane";
import { eq } from "drizzle-orm";

export interface IdentityData {
  email?: string;
  phone?: string;
  name?: string;
  traits?: Record<string, any>;
}

export interface IdentityLinkData {
  provider: "posthog" | "stripe" | "meta" | "app";
  externalId: string;
  metadata?: Record<string, any>;
}

/**
 * Get or create a canonical person record
 * Uses email as the primary matching key
 */
export async function getOrCreatePerson(data: IdentityData) {
  // Try to find existing person by email
  if (data.email) {
    const existingPerson = await getPersonByEmail(data.email);
    if (existingPerson) {
      // Update traits if provided
      if (data.traits) {
        const mergedTraits = { ...(existingPerson.traits || {}), ...data.traits };
        return updatePerson(existingPerson.id, { traits: mergedTraits });
      }
      return existingPerson;
    }
  }

  // Create new person
  return createPerson(data);
}

/**
 * Link an external identity to a person
 * Handles identity stitching when an external ID is encountered
 */
export async function linkIdentity(
  personId: string,
  linkData: IdentityLinkData
): Promise<{ personId: string; isNewLink: boolean }> {
  // Check if this external ID is already linked
  const existingPerson = await findPersonByExternalId(
    linkData.provider,
    linkData.externalId
  );

  if (existingPerson) {
    // External ID already linked to a person
    if (existingPerson.id === personId) {
      // Same person, no action needed
      return { personId, isNewLink: false };
    } else {
      // Different person - this is an identity merge scenario
      // For now, we'll keep the existing link
      // TODO: Implement identity merge logic if needed
      return { personId: existingPerson.id, isNewLink: false };
    }
  }

  // Create new identity link
  await createIdentityLink({
    personId,
    provider: linkData.provider,
    externalId: linkData.externalId,
    metadata: linkData.metadata,
  });

  return { personId, isNewLink: true };
}

/**
 * Resolve a person from an external identity
 * Used when we receive an event from an external system
 */
export async function resolvePersonFromExternalId(
  provider: "posthog" | "stripe" | "meta" | "app",
  externalId: string
): Promise<string | null> {
  const person = await findPersonByExternalId(provider, externalId);
  return person?.id || null;
}

/**
 * Sync app user to person table
 * Creates or updates person record from app user
 */
export async function syncAppUserToPerson(userId: string) {
  // Get app user
  const [appUser] = await db.select().from(users).where(eq(users.id, userId));
  if (!appUser) {
    throw new Error(`User ${userId} not found`);
  }

  // Get or create person
  const person = await getOrCreatePerson({
    email: appUser.email,
    phone: appUser.phone || undefined,
    name: appUser.name,
    traits: {
      role: appUser.role,
      verificationStatus: appUser.verificationStatus,
      accountStatus: appUser.accountStatus,
      createdAt: appUser.createdAt.toISOString(),
    },
  });

  // Link app user ID to person
  await linkIdentity(person.id, {
    provider: "app",
    externalId: userId,
    metadata: {
      role: appUser.role,
    },
  });

  return person;
}

/**
 * Get all identities for a person
 * Returns all external IDs linked to this person
 */
export async function getPersonIdentities(personId: string) {
  const links = await getIdentityLinksByPerson(personId);

  return {
    personId,
    identities: links.reduce((acc, link) => {
      acc[link.provider] = {
        externalId: link.externalId,
        metadata: link.metadata,
        linkedAt: link.createdAt,
      };
      return acc;
    }, {} as Record<string, any>),
  };
}

/**
 * Identify user for tracking purposes
 * Should be called on login/signup to establish identity
 */
export async function identifyUser(userId: string, traits?: Record<string, any>) {
  // Sync user to person table
  const person = await syncAppUserToPerson(userId);

  // Update traits if provided
  if (traits) {
    const mergedTraits = { ...(person.traits || {}), ...traits };
    await updatePerson(person.id, { traits: mergedTraits });
  }

  return person;
}

/**
 * Get person ID from app user ID
 * Used to map app users to the canonical person ID
 */
export async function getPersonIdFromUserId(userId: string): Promise<string | null> {
  return resolvePersonFromExternalId("app", userId);
}
