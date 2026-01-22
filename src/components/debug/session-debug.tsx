"use client"

import { useSession } from "@/lib/hooks/use-session"

export function SessionDebug() {
  const { session, isAuthenticated, isLoading } = useSession()

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-sm z-50">
      <div className="font-bold mb-2">Session Debug</div>
      <div className="space-y-1">
        <div>
          Status:{" "}
          <span className={isAuthenticated ? "text-green-400" : "text-red-400"}>
            {isLoading ? "Loading..." : isAuthenticated ? "Authenticated" : "Not authenticated"}
          </span>
        </div>
        {session && (
          <>
            <div>User ID: {session.user.id}</div>
            <div>Email: {session.user.email}</div>
            <div>Name: {session.user.name}</div>
            <div>Role: {session.user.role}</div>
          </>
        )}
      </div>
    </div>
  )
}
