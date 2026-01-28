"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TwoFactorVerifyProps {
  userId: string;
  onVerified: () => void;
  onCancel: () => void;
}

export function TwoFactorVerify({ userId, onVerified, onCancel }: TwoFactorVerifyProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const token = formData.get("token") as string;

    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify token");
      }

      onVerified();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Invalid token");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Two-Factor Authentication</CardTitle>
        <CardDescription className="text-center">
          {useBackupCode
            ? "Enter one of your backup codes"
            : "Enter the 6-digit code from your authenticator app"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="token">
              {useBackupCode ? "Backup Code" : "Authentication Code"}
            </Label>
            <Input
              id="token"
              name="token"
              type="text"
              placeholder={useBackupCode ? "XXXXXXXX" : "000000"}
              pattern={useBackupCode ? "[A-Z0-9]{8}" : "[0-9]{6}"}
              maxLength={useBackupCode ? 8 : 6}
              required
              disabled={isLoading}
              autoFocus
              className="text-center text-2xl tracking-widest"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
          <div className="space-y-2">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setUseBackupCode(!useBackupCode)}
              disabled={isLoading}
            >
              {useBackupCode ? "Use authenticator code" : "Use backup code"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onCancel}
              disabled={isLoading}
            >
              Back to Sign In
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
