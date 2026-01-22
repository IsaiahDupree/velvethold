import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file
config({ path: resolve(process.cwd(), ".env.local") });

import {
  createProfile,
  getProfileById,
  getProfileByUserId,
  updateProfile,
  updateProfileByUserId,
  deleteProfile,
  deleteProfileByUserId,
  searchProfiles,
  countProfiles,
  userHasProfile,
  getProfileWithUser,
  getProfilesByIntent,
  getProfilesByCity,
  getProfilesByAgeRange,
} from "@/db/queries/profiles";
import {
  createUser,
  deleteUser,
} from "@/db/queries/users";

/**
 * Test suite for Profile CRUD queries
 *
 * To run these tests:
 * 1. Ensure DATABASE_URL is set in .env.local
 * 2. Run: npx tsx tests/profile-queries.test.ts
 */

async function runTests() {
  console.log("🧪 Starting Profile CRUD Query Tests\n");

  let testUserId: string | null = null;
  let testProfileId: string | null = null;

  try {
    // Setup: Create a test user first
    console.log("🔧 Setup: Creating test user");
    const testUser = await createUser({
      name: "Test User",
      email: `test-${Date.now()}@example.com`,
      password: "SecurePassword123!",
      role: "invitee",
    });

    if (!testUser || !testUser.id) {
      throw new Error("Failed to create test user");
    }
    testUserId = testUser.id;
    console.log(`  ✓ Test user created with ID: ${testUser.id}\n`);

    // Test 1: Create Profile
    console.log("✓ Test 1: Create Profile");
    const newProfile = await createProfile({
      userId: testUserId,
      displayName: "Test Profile",
      age: 28,
      city: "San Francisco",
      bio: "This is a test bio for testing profile queries",
      intent: "dating",
      depositAmount: 50,
      availabilityVisibility: "verified",
    });

    if (!newProfile || !newProfile.id) {
      throw new Error("Failed to create profile");
    }
    testProfileId = newProfile.id;
    console.log(`  ✓ Profile created with ID: ${newProfile.id}`);

    // Test 2: Get Profile by ID
    console.log("\n✓ Test 2: Get Profile by ID");
    const profileById = await getProfileById(testProfileId);
    if (!profileById || profileById.id !== testProfileId) {
      throw new Error("Failed to get profile by ID");
    }
    console.log(`  ✓ Retrieved profile: ${profileById.displayName}`);

    // Test 3: Get Profile by User ID
    console.log("\n✓ Test 3: Get Profile by User ID");
    const profileByUserId = await getProfileByUserId(testUserId);
    if (!profileByUserId || profileByUserId.id !== testProfileId) {
      throw new Error("Failed to get profile by user ID");
    }
    console.log(`  ✓ Retrieved profile by user ID: ${profileByUserId.displayName}`);

    // Test 4: User Has Profile Check
    console.log("\n✓ Test 4: User Has Profile Check");
    const hasProfile = await userHasProfile(testUserId);
    if (!hasProfile) {
      throw new Error("User should have a profile");
    }
    console.log(`  ✓ User has profile: ${hasProfile}`);

    // Test 5: Update Profile
    console.log("\n✓ Test 5: Update Profile");
    const updatedProfile = await updateProfile(testProfileId, {
      displayName: "Updated Test Profile",
      bio: "Updated bio for testing",
      age: 29,
    });
    if (!updatedProfile || updatedProfile.displayName !== "Updated Test Profile") {
      throw new Error("Failed to update profile");
    }
    console.log(`  ✓ Profile updated: ${updatedProfile.displayName}`);

    // Test 6: Update Profile by User ID
    console.log("\n✓ Test 6: Update Profile by User ID");
    const updatedProfileByUserId = await updateProfileByUserId(testUserId, {
      city: "Los Angeles",
      intent: "relationship",
    });
    if (!updatedProfileByUserId || updatedProfileByUserId.city !== "Los Angeles") {
      throw new Error("Failed to update profile by user ID");
    }
    console.log(`  ✓ Profile updated by user ID: ${updatedProfileByUserId.city}`);

    // Test 7: Search Profiles
    console.log("\n✓ Test 7: Search Profiles");
    const searchResults = await searchProfiles({
      query: "Updated",
      intent: "relationship",
    });
    if (searchResults.length === 0) {
      throw new Error("Failed to search profiles");
    }
    console.log(`  ✓ Found ${searchResults.length} profile(s)`);

    // Test 8: Get Profiles by Intent
    console.log("\n✓ Test 8: Get Profiles by Intent");
    const profilesByIntent = await getProfilesByIntent("relationship");
    if (profilesByIntent.length === 0) {
      throw new Error("Failed to get profiles by intent");
    }
    console.log(`  ✓ Found ${profilesByIntent.length} profile(s) with intent 'relationship'`);

    // Test 9: Get Profiles by City
    console.log("\n✓ Test 9: Get Profiles by City");
    const profilesByCity = await getProfilesByCity("Los Angeles");
    if (profilesByCity.length === 0) {
      throw new Error("Failed to get profiles by city");
    }
    console.log(`  ✓ Found ${profilesByCity.length} profile(s) in Los Angeles`);

    // Test 10: Get Profiles by Age Range
    console.log("\n✓ Test 10: Get Profiles by Age Range");
    const profilesByAge = await getProfilesByAgeRange(25, 30);
    if (profilesByAge.length === 0) {
      throw new Error("Failed to get profiles by age range");
    }
    console.log(`  ✓ Found ${profilesByAge.length} profile(s) in age range 25-30`);

    // Test 11: Count Profiles
    console.log("\n✓ Test 11: Count Profiles");
    const profileCount = await countProfiles();
    if (profileCount === 0) {
      throw new Error("Profile count should be > 0");
    }
    console.log(`  ✓ Total profiles in database: ${profileCount}`);

    // Test 12: Get Profile with User Details
    console.log("\n✓ Test 12: Get Profile with User Details");
    const profileWithUser = await getProfileWithUser(testProfileId);
    if (!profileWithUser || !profileWithUser.user) {
      throw new Error("Failed to get profile with user details");
    }
    console.log(`  ✓ Retrieved profile with user: ${profileWithUser.user.name}`);

    // Test 13: Delete Profile
    console.log("\n✓ Test 13: Delete Profile");
    const deletedProfile = await deleteProfile(testProfileId);
    if (!deletedProfile) {
      throw new Error("Failed to delete profile");
    }
    console.log(`  ✓ Profile deleted: ${deletedProfile.id}`);
    testProfileId = null; // Mark as deleted

    // Test 14: Verify Profile Deletion
    console.log("\n✓ Test 14: Verify Profile Deletion");
    const deletedProfileCheck = await getProfileById(deletedProfile.id);
    if (deletedProfileCheck !== null) {
      throw new Error("Profile should be deleted");
    }
    console.log(`  ✓ Profile successfully deleted from database`);

    // Test 15: Create Another Profile for Delete by User ID Test
    console.log("\n✓ Test 15: Create Another Profile for Delete by User ID Test");
    const anotherProfile = await createProfile({
      userId: testUserId,
      displayName: "Another Test Profile",
      age: 30,
      city: "New York",
      intent: "friends",
    });
    if (!anotherProfile) {
      throw new Error("Failed to create another profile");
    }
    testProfileId = anotherProfile.id;
    console.log(`  ✓ Another profile created with ID: ${anotherProfile.id}`);

    // Test 16: Delete Profile by User ID
    console.log("\n✓ Test 16: Delete Profile by User ID");
    const deletedProfileByUserId = await deleteProfileByUserId(testUserId);
    if (!deletedProfileByUserId) {
      throw new Error("Failed to delete profile by user ID");
    }
    console.log(`  ✓ Profile deleted by user ID: ${deletedProfileByUserId.id}`);
    testProfileId = null; // Mark as deleted

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);

    // Cleanup: Delete test profile and user if they exist
    if (testProfileId) {
      try {
        await deleteProfile(testProfileId);
        console.log("\n🧹 Cleaned up test profile");
      } catch (cleanupError) {
        console.error("Failed to cleanup test profile:", cleanupError);
      }
    }

    if (testUserId) {
      try {
        await deleteUser(testUserId);
        console.log("🧹 Cleaned up test user");
      } catch (cleanupError) {
        console.error("Failed to cleanup test user:", cleanupError);
      }
    }

    process.exit(1);
  }

  // Final Cleanup: Delete test user (profile should be cascade deleted)
  if (testUserId) {
    try {
      await deleteUser(testUserId);
      console.log("\n🧹 Final cleanup: Test user deleted");
    } catch (cleanupError) {
      console.error("Failed to cleanup test user:", cleanupError);
    }
  }
}

runTests();
