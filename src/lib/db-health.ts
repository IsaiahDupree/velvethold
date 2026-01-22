import { db, client } from "@/db"
import { sql } from "drizzle-orm"

export async function checkDatabaseConnection(): Promise<{
  connected: boolean
  error?: string
  latency?: number
}> {
  try {
    const start = Date.now()
    await db.execute(sql`SELECT 1`)
    const latency = Date.now() - start

    return {
      connected: true,
      latency,
    }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getDatabaseInfo() {
  try {
    const versionResult = await db.execute(sql`SELECT version()`)
    const version = versionResult.rows[0]?.version || "Unknown"

    const maxConnectionsResult = await db.execute(
      sql`SHOW max_connections`
    )
    const maxConnections =
      maxConnectionsResult.rows[0]?.max_connections || "Unknown"

    return {
      version,
      maxConnections,
    }
  } catch (error) {
    throw new Error(
      `Failed to get database info: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

export async function closeDatabaseConnection() {
  try {
    await client.end()
  } catch (error) {
    console.error("Error closing database connection:", error)
  }
}
