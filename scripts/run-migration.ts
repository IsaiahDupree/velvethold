import { db } from "@/db";
import { sql } from "drizzle-orm";

async function runMigration() {
  try {
    console.log("Running date confirmation migration...");

    await db.execute(sql`ALTER TABLE "date_requests" ADD COLUMN IF NOT EXISTS "date_confirmed_at" timestamp`);
    await db.execute(sql`ALTER TABLE "date_requests" ADD COLUMN IF NOT EXISTS "confirmed_date_time" timestamp`);
    await db.execute(sql`ALTER TABLE "date_requests" ADD COLUMN IF NOT EXISTS "confirmed_location" varchar(500)`);
    await db.execute(sql`ALTER TABLE "date_requests" ADD COLUMN IF NOT EXISTS "confirmed_details" text`);
    await db.execute(sql`ALTER TABLE "date_requests" ADD COLUMN IF NOT EXISTS "invitee_confirmed" boolean DEFAULT false NOT NULL`);
    await db.execute(sql`ALTER TABLE "date_requests" ADD COLUMN IF NOT EXISTS "requester_confirmed" boolean DEFAULT false NOT NULL`);

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

runMigration();
