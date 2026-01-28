"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";

interface SafetyBannerProps {
  isVerified: boolean;
  otherUserName: string;
}

export function SafetyBanner({ isVerified, otherUserName }: SafetyBannerProps) {
  if (isVerified) {
    return (
      <Alert className="mb-4">
        <Shield className="h-4 w-4" />
        <AlertTitle>Verified User</AlertTitle>
        <AlertDescription>
          {otherUserName} has completed identity verification. Always keep communication on the platform and report any suspicious behavior.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Unverified User</AlertTitle>
      <AlertDescription>
        {otherUserName} has not completed identity verification. Be extra cautious and never share personal information, contact details, or financial information.
      </AlertDescription>
    </Alert>
  );
}
