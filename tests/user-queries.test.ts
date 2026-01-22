import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file
config({ path: resolve(process.cwd(), ".env.local") });

import {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  updateUserPassword,
  verifyUserPassword,
  deleteUser,
  searchUsers,
  countUsers,
  emailExists,
} from "@/db/queries/users";

/**
 * Test suite for User CRUD queries
 *
 * To run these tests:
 * 1. Ensure DATABASE_URL is set in .env.local
 * 2. Run: npx tsx tests/user-queries.test.ts
 */

async function runTests() {
  console.log("🧪 Starting User CRUD Query Tests\n");

  let testUserId: string | null = null;

  try {
    // Test 1: Create User
    console.log("✓ Test 1: Create User");
    const newUser = await createUser({
      name: "Test User",
      email: `test-${Date.now()}@example.com`,
      password: "SecurePassword123!",
      phone: "+1234567890",
      role: "requester",
    });

    if (!newUser || !newUser.id) {
      throw new Error("Failed to create user");
    }
    testUserId = newUser.id;
    console.log(`  ✓ User created with ID: ${newUser.id}`);

    // Test 2: Get User by ID
    console.log("\n✓ Test 2: Get User by ID");
    const userById = await getUserById(testUserId);
    if (!userById || userById.id !== testUserId) {
      throw new Error("Failed to get user by ID");
    }
    console.log(`  ✓ Retrieved user: ${userById.name}`);

    // Test 3: Get User by Email
    console.log("\n✓ Test 3: Get User by Email");
    const userByEmail = await getUserByEmail(newUser.email);
    if (!userByEmail || userByEmail.id !== testUserId) {
      throw new Error("Failed to get user by email");
    }
    console.log(`  ✓ Retrieved user by email: ${userByEmail.email}`);

    // Test 4: Email Exists Check
    console.log("\n✓ Test 4: Email Exists Check");
    const exists = await emailExists(newUser.email);
    if (!exists) {
      throw new Error("Email should exist");
    }
    console.log(`  ✓ Email exists: ${exists}`);

    // Test 5: Verify Password
    console.log("\n✓ Test 5: Verify User Password");
    const verifiedUser = await verifyUserPassword(
      newUser.email,
      "SecurePassword123!"
    );
    if (!verifiedUser) {
      throw new Error("Failed to verify password");
    }
    console.log(`  ✓ Password verified successfully`);

    // Test 6: Update User
    console.log("\n✓ Test 6: Update User");
    const updatedUser = await updateUser(testUserId, {
      name: "Updated Test User",
      phone: "+9876543210",
    });
    if (!updatedUser || updatedUser.name !== "Updated Test User") {
      throw new Error("Failed to update user");
    }
    console.log(`  ✓ User updated: ${updatedUser.name}`);

    // Test 7: Update Password
    console.log("\n✓ Test 7: Update User Password");
    const userWithNewPassword = await updateUserPassword(testUserId, {
      currentPassword: "SecurePassword123!",
      newPassword: "NewSecurePassword456!",
    });
    if (!userWithNewPassword) {
      throw new Error("Failed to update password");
    }
    console.log(`  ✓ Password updated successfully`);

    // Test 8: Verify New Password
    console.log("\n✓ Test 8: Verify New Password");
    const verifiedNewPassword = await verifyUserPassword(
      newUser.email,
      "NewSecurePassword456!"
    );
    if (!verifiedNewPassword) {
      throw new Error("Failed to verify new password");
    }
    console.log(`  ✓ New password verified successfully`);

    // Test 9: Search Users
    console.log("\n✓ Test 9: Search Users");
    const searchResults = await searchUsers({
      query: "Updated",
      role: "requester",
    });
    if (searchResults.length === 0) {
      throw new Error("Failed to search users");
    }
    console.log(`  ✓ Found ${searchResults.length} user(s)`);

    // Test 10: Count Users
    console.log("\n✓ Test 10: Count Users");
    const userCount = await countUsers();
    if (userCount === 0) {
      throw new Error("User count should be > 0");
    }
    console.log(`  ✓ Total users in database: ${userCount}`);

    // Test 11: Delete User
    console.log("\n✓ Test 11: Delete User");
    const deletedUser = await deleteUser(testUserId);
    if (!deletedUser) {
      throw new Error("Failed to delete user");
    }
    console.log(`  ✓ User deleted: ${deletedUser.id}`);

    // Test 12: Verify Deletion
    console.log("\n✓ Test 12: Verify User Deletion");
    const deletedUserCheck = await getUserById(testUserId);
    if (deletedUserCheck !== null) {
      throw new Error("User should be deleted");
    }
    console.log(`  ✓ User successfully deleted from database`);

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);

    // Cleanup: Delete test user if it exists
    if (testUserId) {
      try {
        await deleteUser(testUserId);
        console.log("\n🧹 Cleaned up test user");
      } catch (cleanupError) {
        console.error("Failed to cleanup test user:", cleanupError);
      }
    }

    process.exit(1);
  }
}

runTests();
