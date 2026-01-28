/**
 * Test Script for Segment Engine
 *
 * This script demonstrates the segment engine functionality:
 * 1. Creating segment definitions with criteria and automations
 * 2. Evaluating segment membership based on person features
 * 3. Triggering automations (Resend, Meta, webhooks)
 */

import { db } from "@/db";
import { segment, person, personFeatures } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSegment } from "@/db/queries/growth-data-plane";
import {
  evaluateSegmentMembership,
  getPersonSegments,
  evaluateSegmentsAfterEvent,
  getSegmentStats,
  type SegmentCriteria,
  type AutomationConfig,
} from "@/lib/growth/segment-engine";

async function runSegmentTests() {
  console.log("🧪 Segment Engine Test Suite\n");

  // Test 1: Create test segments
  console.log("1️⃣ Creating test segments...");

  // Segment 1: Active Users (5+ active days, 3+ core actions)
  const activeUsersCriteria: SegmentCriteria = {
    features: {
      activeDays: { min: 5 },
      coreActions: { min: 3 },
    },
  };

  const activeUsersAutomation: AutomationConfig = {
    resend: {
      audienceId: "active-users-list",
      trigger: "on_enter",
    },
    meta: {
      customAudienceId: "123456789",
      action: "add",
    },
  };

  const activeUsersSegment = await createSegment({
    name: "Active Users",
    description: "Users with 5+ active days and 3+ core actions",
    criteria: activeUsersCriteria,
    automationConfig: activeUsersAutomation,
  });

  console.log(`✅ Created segment: ${activeUsersSegment.name} (${activeUsersSegment.id})`);

  // Segment 2: Engaged Pricing Viewers (viewed pricing 2+ times)
  const pricingViewersCriteria: SegmentCriteria = {
    features: {
      pricingViews: { min: 2 },
    },
  };

  const pricingViewersAutomation: AutomationConfig = {
    webhook: {
      url: "https://api.example.com/segment-event",
      method: "POST",
      headers: {
        "X-API-Key": "test-key",
      },
    },
  };

  const pricingViewersSegment = await createSegment({
    name: "Engaged Pricing Viewers",
    description: "Users who have viewed pricing 2+ times",
    criteria: pricingViewersCriteria,
    automationConfig: pricingViewersAutomation,
  });

  console.log(`✅ Created segment: ${pricingViewersSegment.name} (${pricingViewersSegment.id})`);

  // Segment 3: Email Engaged (opened 3+ emails, clicked 1+ times)
  const emailEngagedCriteria: SegmentCriteria = {
    features: {
      emailOpens: { min: 3 },
      emailClicks: { min: 1 },
    },
  };

  const emailEngagedSegment = await createSegment({
    name: "Email Engaged",
    description: "Users highly engaged with email content",
    criteria: emailEngagedCriteria,
  });

  console.log(`✅ Created segment: ${emailEngagedSegment.name} (${emailEngagedSegment.id})\n`);

  // Test 2: Evaluate segment membership for existing people
  console.log("2️⃣ Evaluating segment membership for people...");

  const allPeople = await db.select({ id: person.id }).from(person).limit(5);

  if (allPeople.length === 0) {
    console.log("⚠️  No people found in database. Skipping membership evaluation.\n");
  } else {
    for (const p of allPeople) {
      const segments = await getPersonSegments(p.id);
      const features = await db
        .select()
        .from(personFeatures)
        .where(eq(personFeatures.personId, p.id))
        .limit(1);

      console.log(`Person ${p.id.substring(0, 8)}:`);
      if (features[0]) {
        console.log(
          `  Features: ${features[0].activeDays} active days, ${features[0].coreActions} core actions, ${features[0].pricingViews} pricing views`
        );
      }
      console.log(`  Segments: ${segments.length > 0 ? segments.join(", ") : "None"}`);
    }
    console.log();
  }

  // Test 3: Get segment statistics
  console.log("3️⃣ Getting segment statistics...");

  const activeUsersStats = await getSegmentStats(activeUsersSegment.id);
  console.log(`${activeUsersSegment.name}: ${activeUsersStats.memberCount} members`);

  const pricingViewersStats = await getSegmentStats(pricingViewersSegment.id);
  console.log(`${pricingViewersSegment.name}: ${pricingViewersStats.memberCount} members`);

  const emailEngagedStats = await getSegmentStats(emailEngagedSegment.id);
  console.log(`${emailEngagedSegment.name}: ${emailEngagedStats.memberCount} members\n`);

  // Test 4: Test segment membership evaluation with specific criteria
  console.log("4️⃣ Testing specific segment criteria...");

  // Test active users criteria
  const testPeople = await db.select().from(person).limit(3);

  if (testPeople.length > 0) {
    for (const p of testPeople) {
      const isActiveUser = await evaluateSegmentMembership(p.id, activeUsersCriteria);
      const isPricingViewer = await evaluateSegmentMembership(p.id, pricingViewersCriteria);
      const isEmailEngaged = await evaluateSegmentMembership(p.id, emailEngagedCriteria);

      console.log(`Person ${p.id.substring(0, 8)}:`);
      console.log(`  Active User: ${isActiveUser ? "✅" : "❌"}`);
      console.log(`  Pricing Viewer: ${isPricingViewer ? "✅" : "❌"}`);
      console.log(`  Email Engaged: ${isEmailEngaged ? "✅" : "❌"}`);
    }
  } else {
    console.log("⚠️  No people found for testing\n");
  }

  console.log("\n✅ All tests completed!");
  console.log("\n📚 Usage Examples:");
  console.log("- Create segments with custom criteria via API: POST /api/growth/segments");
  console.log("- Evaluate segments after events: POST /api/growth/segments/evaluate");
  console.log("- Get segment stats: GET /api/growth/segments/[id]/stats");
  console.log("- Segments are automatically evaluated on every event ingestion");
}

// Run tests
runSegmentTests()
  .then(() => {
    console.log("\n✅ Test script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test script failed:", error);
    process.exit(1);
  });
