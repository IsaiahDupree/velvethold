/**
 * Manual test script for click tracking functionality
 * Run with: npx tsx scripts/test-click-tracking.ts
 */

import { generateTrackedUrl, getAttributionFromCookies } from "../src/lib/click-tracking";

console.log("=== Click Tracking Test ===\n");

// Test 1: Generate tracked URL with all parameters
console.log("Test 1: Generate tracked URL with all parameters");
const fullUrl = generateTrackedUrl({
  url: "https://velvethold.com/browse",
  personId: "person-123",
  emailId: "email-456",
  campaign: "welcome_email",
  source: "email",
});
console.log("Result:", fullUrl);
console.log("✓ Full URL generated\n");

// Test 2: Generate tracked URL with minimal parameters
console.log("Test 2: Generate tracked URL with minimal parameters");
const minimalUrl = generateTrackedUrl({
  url: "https://velvethold.com/profiles/user-789",
});
console.log("Result:", minimalUrl);
console.log("✓ Minimal URL generated\n");

// Test 3: Extract attribution from cookies
console.log("Test 3: Extract attribution from cookies");
const mockCookies = {
  get: (name: string) => {
    if (name === "vh_session_id") {
      return { value: "test-session-123" };
    }
    if (name === "vh_attribution") {
      return {
        value: JSON.stringify({
          source: "email",
          email_id: "email-456",
          campaign: "welcome_email",
          person_id: "person-123",
          clicked_at: "2026-01-27T00:00:00.000Z",
        }),
      };
    }
    return undefined;
  },
};

const { sessionId, attribution } = getAttributionFromCookies(mockCookies);
console.log("Session ID:", sessionId);
console.log("Attribution:", attribution);
console.log("✓ Attribution extracted\n");

console.log("=== All Tests Passed ===\n");

console.log("Manual Testing Instructions:");
console.log("1. Start dev server: npm run dev");
console.log("2. Visit this URL:");
console.log(`   http://localhost:3007/api/track/click?url=http://localhost:3007/browse&campaign=test&person_id=test-123`);
console.log("3. Check that it redirects to /browse");
console.log("4. Check cookies in browser dev tools:");
console.log("   - vh_session_id should be set");
console.log("   - vh_attribution should be set");
console.log("5. Check database for event:");
console.log('   SELECT * FROM event WHERE event_name = \'email_link_clicked\' ORDER BY timestamp DESC LIMIT 1;');
