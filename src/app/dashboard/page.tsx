import { requireAuth } from "@/lib/session"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await requireAuth()

  // Redirect to appropriate dashboard based on user role
  if (session.user.role === "invitee") {
    redirect("/inbox")
  } else if (session.user.role === "requester") {
    redirect("/browse")
  }

  // For "both" role, default to browse
  redirect("/browse")
}
