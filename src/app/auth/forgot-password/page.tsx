"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "An error occurred. Please try again.")
        setIsLoading(false)
      } else {
        setSuccess(true)
        setIsLoading(false)
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3B1E4A]/5 via-[#5A2D82]/5 to-[#E7B7D2]/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="text-3xl font-bold text-primary">
              VelvetHold
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">Forgot password?</CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we&apos;ll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                If an account exists with that email, a password reset link has been sent. Please check your email.
              </div>
              <div className="text-center text-sm">
                <Link href="/auth/signin" className="text-primary hover:underline font-medium">
                  Return to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>
              <div className="text-center text-sm">
                <Link href="/auth/signin" className="text-primary hover:underline">
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
