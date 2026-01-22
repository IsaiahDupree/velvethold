import { NextResponse } from "next/server"
import { checkDatabaseConnection, getDatabaseInfo } from "@/lib/db-health"

export async function GET() {
  try {
    const connectionCheck = await checkDatabaseConnection()

    if (!connectionCheck.connected) {
      return NextResponse.json(
        {
          status: "error",
          connected: false,
          error: connectionCheck.error,
        },
        { status: 503 }
      )
    }

    const dbInfo = await getDatabaseInfo()

    return NextResponse.json({
      status: "healthy",
      connected: true,
      latency: connectionCheck.latency,
      database: {
        version: dbInfo.version,
        maxConnections: dbInfo.maxConnections,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
