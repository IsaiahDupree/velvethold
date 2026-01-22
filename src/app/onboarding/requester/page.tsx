"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STEPS = [
  { id: 1, title: "Basic Info", description: "Tell us about yourself" },
  { id: 2, title: "Preferences", description: "What you're looking for" },
  { id: 3, title: "Verification", description: "Complete your profile" },
];

export default function RequesterOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: "",
    age: "",
    city: "",
    bio: "",
    intent: "dating",
    datePreferences: [] as string[],
    employment: "",
    education: "",
  });

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleDatePreference = (pref: string) => {
    const current = formData.datePreferences;
    if (current.includes(pref)) {
      updateFormData("datePreferences", current.filter(p => p !== pref));
    } else {
      updateFormData("datePreferences", [...current, pref]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3B1E4A]/5 via-[#5A2D82]/5 to-[#E7B7D2]/5 p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary">
            VelvetHold
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">Requester Profile Setup</h1>
          <p className="text-muted-foreground">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].description}
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep >= step.id
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.id}
                  </div>
                  <span className="text-xs mt-2 hidden sm:block">{step.title}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-colors ${
                      currentStep > step.id ? "bg-secondary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => updateFormData("displayName", e.target.value)}
                    placeholder="How should matches see you?"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      min="18"
                      value={formData.age}
                      onChange={(e) => updateFormData("age", e.target.value)}
                      placeholder="18+"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateFormData("city", e.target.value)}
                      placeholder="New York, NY"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">About Me *</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => updateFormData("bio", e.target.value)}
                    placeholder="Tell potential matches about yourself..."
                    rows={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.bio.length}/500 characters
                  </p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>What are you looking for? *</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {["dating", "relationship", "friends"].map((intent) => (
                      <button
                        key={intent}
                        type="button"
                        onClick={() => updateFormData("intent", intent)}
                        className={`p-3 rounded-lg border-2 transition-colors capitalize ${
                          formData.intent === intent
                            ? "border-secondary bg-secondary/10"
                            : "border-border hover:border-secondary/50"
                        }`}
                      >
                        {intent}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Date Types (select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Coffee", "Dinner", "Activity", "Museum", "Drinks", "Walk"].map((pref) => (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => toggleDatePreference(pref)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          formData.datePreferences.includes(pref)
                            ? "border-secondary bg-secondary/10"
                            : "border-border hover:border-secondary/50"
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employment">Employment (Optional)</Label>
                    <Input
                      id="employment"
                      value={formData.employment}
                      onChange={(e) => updateFormData("employment", e.target.value)}
                      placeholder="Software Engineer at..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="education">Education (Optional)</Label>
                    <Input
                      id="education"
                      value={formData.education}
                      onChange={(e) => updateFormData("education", e.target.value)}
                      placeholder="University of..."
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                  <h3 className="font-semibold text-lg">Complete Your Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Before you can send date requests, you&apos;ll need to:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-secondary mt-0.5">✓</span>
                      <span>Complete identity verification (selfie + ID)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary mt-0.5">✓</span>
                      <span>Upload profile photos (minimum 2)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary mt-0.5">✓</span>
                      <span>Add a payment method for deposits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary mt-0.5">✓</span>
                      <span>Review and agree to community guidelines</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-sm">How Deposits Work</h4>
                  <p className="text-sm text-muted-foreground">
                    When you send a date request, you&apos;ll pay a refundable deposit set by the invitee.
                    If they decline, you get a full refund. If they approve and the date happens,
                    the deposit is refunded per their cancellation policy.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              {currentStep < STEPS.length ? (
                <Button onClick={handleNext} variant="secondary">
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} variant="secondary">
                  Complete Setup
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
