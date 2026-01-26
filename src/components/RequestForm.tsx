"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CreditCard, Heart, Loader2, MapPin, Shield } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe-client";

interface RequestFormProps {
  profile: {
    id: string;
    userId: string;
    displayName: string;
    age: number;
    city: string;
    bio?: string | null;
    intent?: string | null;
    depositAmount?: number | null;
    screeningQuestions?: unknown;
    boundaries?: string | null;
    cancellationPolicy?: string | null;
  };
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function PaymentForm({
  clientSecret,
  onSuccess,
  onBack
}: {
  clientSecret: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/request/success`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed");
        setIsProcessing(false);
      } else {
        onSuccess();
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Complete Payment"
          )}
        </Button>
      </div>
    </form>
  );
}

export function RequestForm({ profile }: RequestFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "payment">("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const screeningQuestions = isRecord(profile.screeningQuestions)
    ? profile.screeningQuestions
    : null;

  const [formData, setFormData] = useState({
    introMessage: "",
    screeningAnswers: {} as Record<string, string>,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleScreeningAnswer = (questionKey: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      screeningAnswers: {
        ...prev.screeningAnswers,
        [questionKey]: value,
      },
    }));
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!profile.depositAmount) {
        setError("Deposit amount is not set for this profile");
        setIsSubmitting(false);
        return;
      }

      if (!formData.introMessage.trim() || formData.introMessage.length < 10) {
        setError("Introduction message must be at least 10 characters");
        setIsSubmitting(false);
        return;
      }

      if (screeningQuestions && Object.keys(screeningQuestions).length > 0) {
        const allQuestionsAnswered = Object.keys(screeningQuestions).every(
          (key) => formData.screeningAnswers[key]?.trim()
        );

        if (!allQuestionsAnswered) {
          setError("Please answer all screening questions");
          setIsSubmitting(false);
          return;
        }
      }

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteeId: profile.userId,
          introMessage: formData.introMessage,
          screeningAnswers: Object.keys(formData.screeningAnswers).length > 0
            ? formData.screeningAnswers
            : undefined,
          depositAmount: profile.depositAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create request");
      }

      const createdRequestId = data.request.id;
      setRequestId(createdRequestId);

      const paymentResponse = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: createdRequestId,
          amount: profile.depositAmount,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || "Failed to create payment intent");
      }

      setClientSecret(paymentData.clientSecret);
      setStep("payment");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    router.push(`/request/success?requestId=${requestId}`);
  };

  const handleBackToDetails = () => {
    setStep("details");
  };

  const stripePromise = getStripe();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
              <div className="text-2xl font-bold text-primary/40">
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl">
                {profile.displayName}, {profile.age}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {profile.city}
                {profile.intent && (
                  <>
                    <span>•</span>
                    <Heart className="h-4 w-4" />
                    {profile.intent.charAt(0).toUpperCase() + profile.intent.slice(1)}
                  </>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {profile.depositAmount && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Deposit Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  A refundable deposit is required to request a date
                </p>
                <p className="text-xs text-muted-foreground">
                  This deposit will be refunded if the request is declined or the date is cancelled according to the policy
                </p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                ${(profile.depositAmount / 100).toFixed(2)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "details" && (
        <form onSubmit={handleDetailsSubmit} className="space-y-6">
          {profile.boundaries && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Boundaries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {profile.boundaries}
                </p>
              </CardContent>
            </Card>
          )}

          {profile.cancellationPolicy && (
            <Card>
              <CardHeader>
                <CardTitle>Cancellation Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {profile.cancellationPolicy}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Introduction Message</CardTitle>
              <CardDescription>
                Write a thoughtful message introducing yourself (minimum 10 characters)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.introMessage}
                onChange={(e) => handleInputChange("introMessage", e.target.value)}
                placeholder="Hi! I would love to meet you because..."
                className="min-h-32"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                {formData.introMessage.length} / 1000 characters
              </p>
            </CardContent>
          </Card>

          {screeningQuestions && Object.keys(screeningQuestions).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Screening Questions
                </CardTitle>
                <CardDescription>
                  Please answer the following questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(screeningQuestions).map(([key, value], index) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`question-${key}`}>
                      {index + 1}. {String(value)}
                    </Label>
                    <Textarea
                      id={`question-${key}`}
                      value={formData.screeningAnswers[key] || ""}
                      onChange={(e) => handleScreeningAnswer(key, e.target.value)}
                      placeholder="Your answer..."
                      required
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Request...
                </>
              ) : (
                "Continue to Payment"
              )}
            </Button>
          </div>
        </form>
      )}

      {step === "payment" && clientSecret && (
        <Card>
          <CardHeader>
            <CardTitle>Complete Payment</CardTitle>
            <CardDescription>
              Enter your payment details to submit the date request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                },
              }}
            >
              <PaymentForm
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                onBack={handleBackToDetails}
              />
            </Elements>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
