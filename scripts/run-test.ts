import { config } from "dotenv";
import { resolve } from "path";
import { execSync } from "child_process";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.local");
  process.exit(1);
}

console.log("✓ Environment variables loaded");
console.log(`✓ DATABASE_URL: ${process.env.DATABASE_URL.substring(0, 30)}...`);

// Run the test
try {
  execSync("npx tsx tests/user-queries.test.ts", {
    stdio: "inherit",
    env: process.env,
  });
} catch (error) {
  process.exit(1);
}
