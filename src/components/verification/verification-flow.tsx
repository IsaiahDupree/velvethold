"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";

type VerificationStatus = "unverified" | "pending" | "verified";

interface VerificationFlowProps {
  userId: string;
  currentStatus: VerificationStatus;
}

export function VerificationFlow({ userId, currentStatus }: VerificationFlowProps) {
  const [status, setStatus] = useState<VerificationStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Poll for status updates when pending
  useEffect(() => {
    if (status === "pending") {
      const interval = setInterval(async () => {
        try {
          const response = await fetch("/api/verification/inquiry");
          if (response.ok) {
            const data = await response.json();
            if (data.verificationStatus !== status) {
              setStatus(data.verificationStatus);
            }
          }
        } catch (error) {
          console.error("Error polling verification status:", error);
        }
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [status]);

  const startVerification = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/verification/inquiry", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to start verification");
      }

      const data = await response.json();
      setSessionToken(data.inquiry.sessionToken);
      setStatus("pending");

      // Initialize Persona embedded flow
      if (data.inquiry.sessionToken) {
        initializePersonaWidget(data.inquiry.sessionToken);
      }
    } catch (error) {
      console.error("Verification start error:", error);
      setError(error instanceof Error ? error.message : "Failed to start verification");
    } finally {
      setLoading(false);
    }
  };

  const initializePersonaWidget = (token: string) => {
    // Load Persona script if not already loaded
    if (!window.Persona) {
      const script = document.createElement("script");
      script.src = "https://cdn.withpersona.com/dist/persona-v4.9.0.js";
      script.integrity = "sha384-/2XeFtv7dYKGFKqQhV0oEGRLEUXMiJmWvQqXBvfIzEU27J4Iq5bptv0dFH2OvYw6";
      script.crossOrigin = "anonymous";
      script.onload = () => {
        openPersonaWidget(token);
      };
      document.body.appendChild(script);
    } else {
      openPersonaWidget(token);
    }
  };

  const openPersonaWidget = (token: string) => {
    const client = new window.Persona.Client({
      templateId: process.env.NEXT_PUBLIC_PERSONA_TEMPLATE_ID || "",
      environmentId: process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID || "",
      sessionToken: token,
      onReady: () => console.log("Persona widget ready"),
      onComplete: ({ inquiryId }: { inquiryId: string }) => {
        console.log("Verification complete:", inquiryId);
        setStatus("pending");
      },
      onCancel: ({ inquiryId }: { inquiryId: string }) => {
        console.log("Verification cancelled:", inquiryId);
      },
      onError: (error: any) => {
        console.error("Persona error:", error);
        setError("An error occurred during verification. Please try again.");
      },
    });

    client.open();
  };

  return (
    <div className="space-y-6">
      {/* Status Display */}
      {status === "verified" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800">Verified</AlertTitle>
          <AlertDescription className="text-green-700">
            Your identity has been successfully verified. You now have full access to all platform features.
          </AlertDescription>
        </Alert>
      )}

      {status === "pending" && (
        <Alert className="border-blue-200 bg-blue-50">
          <Clock className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800">Verification Pending</AlertTitle>
          <AlertDescription className="text-blue-700">
            Your verification is being reviewed. This usually takes a few minutes. We&apos;ll notify you once it&apos;s complete.
          </AlertDescription>
        </Alert>
      )}

      {status === "unverified" && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Shield className="h-5 w-5 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Verification Required</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Complete identity verification to access all features and build trust with other members.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Verification Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Identity Verification
          </CardTitle>
          <CardDescription>
            We use Persona to verify your identity securely and protect the community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {status === "verified" && (
                <>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Verified</p>
                    <p className="text-sm text-muted-foreground">Your identity is confirmed</p>
                  </div>
                </>
              )}
              {status === "pending" && (
                <>
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-800">Under Review</p>
                    <p className="text-sm text-muted-foreground">Verification in progress</p>
                  </div>
                </>
              )}
              {status === "unverified" && (
                <>
                  <Shield className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-800">Not Verified</p>
                    <p className="text-sm text-muted-foreground">Complete verification to continue</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* What You'll Need */}
          {status !== "verified" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">What You&apos;ll Need</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>A government-issued ID (driver&apos;s license, passport, or national ID card)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>A device with a camera to take photos of your ID and a selfie</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>5-10 minutes to complete the process</span>
                </li>
              </ul>
            </div>
          )}

          {/* Privacy & Security */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Privacy & Security
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Your data is encrypted and stored securely</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>We never share your personal information with other members</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Verification is handled by Persona, a trusted third-party service</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          {status === "unverified" && (
            <Button
              onClick={startVerification}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Starting Verification...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Start Verification
                </>
              )}
            </Button>
          )}

          {status === "pending" && (
            <div className="text-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Waiting for verification to complete...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benefits Card */}
      {status !== "verified" && (
        <Card>
          <CardHeader>
            <CardTitle>Benefits of Verification</CardTitle>
            <CardDescription>
              Verified members enjoy these advantages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Increased Trust</p>
                  <p className="text-sm text-muted-foreground">
                    Verified badge shows you&apos;re a real, trustworthy member
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Full Platform Access</p>
                  <p className="text-sm text-muted-foreground">
                    Send and receive date requests without restrictions
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Better Matches</p>
                  <p className="text-sm text-muted-foreground">
                    Connect with other verified members who value safety
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Community Safety</p>
                  <p className="text-sm text-muted-foreground">
                    Help maintain a safe, authentic community for everyone
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Add type declaration for Persona
declare global {
  interface Window {
    Persona?: any;
  }
}
