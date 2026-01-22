import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Please add it to your .env.local file."
  );
}

const connectionString = process.env.DATABASE_URL;

// Create postgres client with connection pooling
const client = postgres(connectionString, {
  max: 10, // Maximum number of connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Timeout for new connections
  prepare: false, // Disable prepared statements for better compatibility
});

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Export client for direct access if needed
export { client };
