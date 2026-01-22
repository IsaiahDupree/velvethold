"use client"

import { useSession as useNextAuthSession } from "next-auth/react"

export function useSession() {
  const { data: session, status } = useNextAuthSession()

  return {
    session,
    user: session?.user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isUnauthenticated: status === "unauthenticated",
  }
}

export function useUser() {
  const { user } = useSession()
  return user
}

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useSession()

  return {
    isAuthenticated,
    isLoading,
    shouldRedirect: !isLoading && !isAuthenticated,
  }
}
