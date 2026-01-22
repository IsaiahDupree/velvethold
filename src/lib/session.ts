import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function getSession() {
  return await auth()
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect("/auth/signin")
  }
  return session
}

export async function requireRole(allowedRoles: Array<"invitee" | "requester" | "both">) {
  const session = await requireAuth()

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/unauthorized")
  }

  return session
}

export async function isAuthenticated() {
  const session = await getSession()
  return !!session
}
