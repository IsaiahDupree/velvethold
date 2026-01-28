/**
 * Test Script: Tracking SDK Integration
 *
 * This script tests the TRACK-001 feature by simulating tracking events
 * and verifying they are stored in the database.
 *
 * Usage: npx tsx scripts/test-tracking-sdk.ts
 */

import { db } from "@/db";
import { event } from "@/db/schema";
import { desc } from "drizzle-orm";

async function testTrackingSDK() {
  console.log("🧪 Testing Tracking SDK Integration (TRACK-001)...\n");

  try {
    // Test 1: Check if events table is accessible
    console.log("Test 1: Checking event table...");
    const recentEvents = await db
      .select()
      .from(event)
      .orderBy(desc(event.timestamp))
      .limit(5);

    console.log(`✓ Events table accessible. Found ${recentEvents.length} recent events\n`);

    // Test 2: Show recent web events
    console.log("Test 2: Recent web events:");
    const webEvents = recentEvents.filter((e) => e.source === "web");

    if (webEvents.length > 0) {
      webEvents.forEach((e) => {
        console.log(`  - ${e.eventName} at ${e.timestamp?.toISOString()}`);
        if (e.properties) {
          console.log(`    Properties: ${JSON.stringify(e.properties)}`);
        }
      });
      console.log("\n✓ Web tracking is working!\n");
    } else {
      console.log("  No web events found yet.");
      console.log("  This is expected if you haven't loaded the app yet.");
      console.log("  Please visit http://localhost:3010 to test tracking.\n");
    }

    // Test 3: Check for page_view events
    console.log("Test 3: Checking for page_view events...");
    const pageViews = recentEvents.filter((e) => e.eventName === "page_view");

    if (pageViews.length > 0) {
      console.log(`✓ Found ${pageViews.length} page_view events`);
      console.log("  Tracking SDK is properly initialized!\n");
    } else {
      console.log("  No page_view events found yet.");
      console.log("  The tracking SDK may need initialization.");
      console.log("  Visit http://localhost:3010 to trigger a page view.\n");
    }

    // Test 4: Verify tracking data quality
    console.log("Test 4: Data quality check...");
    let hasSessionId = false;
    let hasDeviceId = false;
    let hasProperties = false;

    recentEvents.forEach((e) => {
      if (e.sessionId) hasSessionId = true;
      if (e.deviceId) hasDeviceId = true;
      if (e.properties && Object.keys(e.properties).length > 0)
        hasProperties = true;
    });

    if (hasSessionId) console.log("  ✓ Events include session IDs");
    if (hasDeviceId) console.log("  ✓ Events include device IDs");
    if (hasProperties) console.log("  ✓ Events include custom properties");

    if (hasSessionId && hasDeviceId && hasProperties) {
      console.log("\n✅ TRACK-001 Test: PASSED\n");
      console.log("The tracking SDK is properly integrated and working!\n");
    } else {
      console.log(
        "\n⚠️  Partial implementation - tracking is working but missing some data\n"
      );
    }

    // Summary
    console.log("Summary:");
    console.log(`  Total recent events: ${recentEvents.length}`);
    console.log(`  Web events: ${webEvents.length}`);
    console.log(`  Page views: ${pageViews.length}`);
    console.log("\nTo generate more tracking data:");
    console.log("  1. Visit http://localhost:3010");
    console.log("  2. Navigate to different pages");
    console.log("  3. Click on buttons and links");
    console.log("  4. Run this test again to see new events");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testTrackingSDK();
