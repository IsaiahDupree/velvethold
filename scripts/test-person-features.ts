/**
 * Test Person Features Computation
 *
 * This script tests the person features computation system by:
 * 1. Creating test events for a person
 * 2. Computing features
 * 3. Verifying the computed values
 *
 * Usage:
 *   npx tsx scripts/test-person-features.ts
 */

import { db } from "@/db";
import { person, event, emailMessage, emailEvent } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  computePersonFeatures,
  computeActiveDays,
  computeCoreActions,
  computePricingViews,
  computeEmailOpens,
} from "@/lib/growth/features-service";
import { getPersonFeatures } from "@/db/queries/growth-data-plane";

async function testPersonFeatures() {
  console.log("🧪 Testing Person Features Computation\n");

  // Step 1: Create a test person
  console.log("1️⃣  Creating test person...");
  const [testPerson] = await db
    .insert(person)
    .values({
      email: "test-features@example.com",
      name: "Test Features User",
    })
    .returning();
  console.log(`   ✓ Created person: ${testPerson.id}\n`);

  // Step 2: Create test events
  console.log("2️⃣  Creating test events...");

  // Create events on 3 different days for active_days
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  // Core action events
  await db.insert(event).values([
    {
      personId: testPerson.id,
      eventName: "profile_created",
      source: "app",
      timestamp: twoDaysAgo,
    },
    {
      personId: testPerson.id,
      eventName: "profile_completed",
      source: "app",
      timestamp: twoDaysAgo,
    },
    {
      personId: testPerson.id,
      eventName: "date_request_created",
      source: "app",
      timestamp: yesterday,
    },
    {
      personId: testPerson.id,
      eventName: "message_sent",
      source: "app",
      timestamp: today,
    },
  ]);
  console.log("   ✓ Created 4 core action events");

  // Pricing view events
  await db.insert(event).values([
    {
      personId: testPerson.id,
      eventName: "pricing_view",
      source: "web",
      timestamp: yesterday,
    },
    {
      personId: testPerson.id,
      eventName: "pricing_page_view",
      source: "web",
      timestamp: today,
    },
  ]);
  console.log("   ✓ Created 2 pricing view events");

  // Regular page view (not a core action)
  await db.insert(event).values([
    {
      personId: testPerson.id,
      eventName: "page_view",
      source: "web",
      timestamp: today,
    },
  ]);
  console.log("   ✓ Created 1 regular event\n");

  // Create email events
  console.log("3️⃣  Creating email events...");
  const [testEmail] = await db
    .insert(emailMessage)
    .values({
      personId: testPerson.id,
      messageId: "test-message-id",
      subject: "Test Email",
      template: "test_template",
    })
    .returning();

  await db.insert(emailEvent).values([
    {
      emailMessageId: testEmail.id,
      eventType: "opened",
      timestamp: yesterday,
    },
    {
      emailMessageId: testEmail.id,
      eventType: "opened",
      timestamp: today,
    },
    {
      emailMessageId: testEmail.id,
      eventType: "clicked",
      link: "https://example.com",
      timestamp: today,
    },
  ]);
  console.log("   ✓ Created 2 email opens and 1 click\n");

  // Step 3: Compute features
  console.log("4️⃣  Computing features...");
  await computePersonFeatures(testPerson.id);
  console.log("   ✓ Features computed\n");

  // Step 4: Verify computed features
  console.log("5️⃣  Verifying computed features...");
  const features = await getPersonFeatures(testPerson.id);

  if (!features) {
    console.error("   ❌ Features not found!");
    process.exit(1);
  }

  console.log("\n📊 Computed Features:");
  console.log(`   Active Days: ${features.activeDays} (expected: 3)`);
  console.log(`   Core Actions: ${features.coreActions} (expected: 4)`);
  console.log(`   Pricing Views: ${features.pricingViews} (expected: 2)`);
  console.log(`   Email Opens: ${features.emailOpens} (expected: 2)`);
  console.log(`   Email Clicks: ${features.emailClicks} (expected: 1)`);
  console.log(`   Last Active: ${features.lastActiveAt}`);

  // Verify values
  const tests = [
    { name: "Active Days", actual: features.activeDays, expected: 3 },
    { name: "Core Actions", actual: features.coreActions, expected: 4 },
    { name: "Pricing Views", actual: features.pricingViews, expected: 2 },
    { name: "Email Opens", actual: features.emailOpens, expected: 2 },
    { name: "Email Clicks", actual: features.emailClicks, expected: 1 },
  ];

  let allPassed = true;
  console.log("\n✅ Test Results:");
  for (const test of tests) {
    const passed = test.actual === test.expected;
    allPassed = allPassed && passed;
    const icon = passed ? "✓" : "✗";
    console.log(`   ${icon} ${test.name}: ${test.actual} ${passed ? "==" : "!="} ${test.expected}`);
  }

  // Cleanup
  console.log("\n6️⃣  Cleaning up test data...");
  await db.delete(event).where(eq(event.personId, testPerson.id));
  await db.delete(emailEvent).where(eq(emailEvent.emailMessageId, testEmail.id));
  await db.delete(emailMessage).where(eq(emailMessage.id, testEmail.id));
  await db.delete(person).where(eq(person.id, testPerson.id));
  console.log("   ✓ Test data cleaned up\n");

  if (allPassed) {
    console.log("🎉 All tests passed!");
    process.exit(0);
  } else {
    console.error("❌ Some tests failed!");
    process.exit(1);
  }
}

// Run tests
testPersonFeatures().catch((error) => {
  console.error("Error running tests:", error);
  process.exit(1);
});
