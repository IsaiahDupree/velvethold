/**
 * Backfill Script: Sync Existing Users to Person Table
 *
 * This script syncs all existing app users to the canonical person table
 * Run with: npx tsx scripts/backfill-persons.ts
 */

import { db } from "@/db";
import { users } from "@/db/schema";
import { syncAppUserToPerson } from "@/lib/growth/identity-service";

async function backfillPersons() {
  console.log("Starting person table backfill...");

  try {
    // Get all users
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users to sync`);

    let synced = 0;
    let errors = 0;

    // Sync each user
    for (const user of allUsers) {
      try {
        const person = await syncAppUserToPerson(user.id);
        console.log(`✓ Synced user ${user.email} → person ${person.id}`);
        synced++;
      } catch (error) {
        console.error(`✗ Failed to sync user ${user.email}:`, error);
        errors++;
      }
    }

    console.log("\nBackfill complete!");
    console.log(`- Synced: ${synced}`);
    console.log(`- Errors: ${errors}`);
    console.log(`- Total: ${allUsers.length}`);
  } catch (error) {
    console.error("Backfill failed:", error);
    process.exit(1);
  }
}

// Run the backfill
backfillPersons()
  .then(() => {
    console.log("\nExiting...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });
