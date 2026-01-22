import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

async function runMigration() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }

  console.log("🔄 Running database migrations...")

  const client = postgres(connectionString, { max: 1 })
  const db = drizzle(client)

  try {
    await migrate(db, { migrationsFolder: "./drizzle" })
    console.log("✅ Migrations completed successfully")
  } catch (error) {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
