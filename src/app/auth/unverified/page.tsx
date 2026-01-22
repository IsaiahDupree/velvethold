"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Loader2 } from "lucide-react"

export default function UnverifiedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (session.user.verificationStatus === "verified") {
      router.push("/")
    }
  }, [session, status, router])

  const handleResendEmail = async () => {
    setResending(true)
    setMessage("")

    try {
      // TODO: Implement resend verification email endpoint
      // For now, just show a message
      setMessage("Verification email resent. Please check your inbox.")
    } catch (error) {
      setMessage("Failed to resend verification email. Please try again.")
    } finally {
      setResending(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3B1E4A] via-[#5A2D82] to-[#E7B7D2] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Please check your email and click the verification link to activate your account.
              If you don't see the email, check your spam folder.
            </p>

            {message && (
              <p className="text-sm text-primary font-medium">
                {message}
              </p>
            )}
          </div>

          <Button
            onClick={handleResendEmail}
            variant="outline"
            className="w-full"
            disabled={resending}
          >
            {resending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resending...
              </>
            ) : (
              "Resend Verification Email"
            )}
          </Button>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => router.push("/auth/signout")}
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
