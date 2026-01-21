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
  { id: 3, title: "Screening", description: "Set your questions" },
  { id: 4, title: "Terms", description: "Deposit & policies" },
  { id: 5, title: "Availability", description: "When you're free" },
];

export default function InviteeOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: "",
    age: "",
    city: "",
    bio: "",
    intent: "dating",
    datePreferences: [] as string[],
    boundaries: "",
    screeningQuestions: ["", "", ""],
    depositAmount: "",
    cancellationPolicy: "",
    availabilityVisibility: "verified",
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
          <h1 className="text-3xl font-bold mt-4 mb-2">Invitee Profile Setup</h1>
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
                        ? "bg-primary text-primary-foreground"
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
                      currentStep > step.id ? "bg-primary" : "bg-muted"
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
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {intent}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Date Preferences (select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Coffee", "Dinner", "Activity", "Museum", "Drinks", "Walk"].map((pref) => (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => toggleDatePreference(pref)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          formData.datePreferences.includes(pref)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="boundaries">Boundaries & Dealbreakers</Label>
                  <Textarea
                    id="boundaries"
                    value={formData.boundaries}
                    onChange={(e) => updateFormData("boundaries", e.target.value)}
                    placeholder="e.g., Public places only for first dates, No late-night meetups..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Set 3 screening questions that requesters must answer when sending you a date request.
                </p>
                {[0, 1, 2].map((index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`question-${index}`}>Question {index + 1} *</Label>
                    <Input
                      id={`question-${index}`}
                      value={formData.screeningQuestions[index]}
                      onChange={(e) => {
                        const newQuestions = [...formData.screeningQuestions];
                        newQuestions[index] = e.target.value;
                        updateFormData("screeningQuestions", newQuestions);
                      }}
                      placeholder={
                        index === 0
                          ? "What's your idea of a good first date?"
                          : index === 1
                          ? "What are you looking for?"
                          : "Why would you like to meet me?"
                      }
                      required
                    />
                  </div>
                ))}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="depositAmount">Deposit Amount (USD) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="depositAmount"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.depositAmount}
                      onChange={(e) => updateFormData("depositAmount", e.target.value)}
                      placeholder="25"
                      className="pl-7"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This refundable deposit ensures serious intentions. Recommended: $25-$50
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancellationPolicy">Cancellation Policy *</Label>
                  <Textarea
                    id="cancellationPolicy"
                    value={formData.cancellationPolicy}
                    onChange={(e) => updateFormData("cancellationPolicy", e.target.value)}
                    placeholder="e.g., Full refund if canceled 24+ hours before. 50% refund if canceled within 24 hours. No refund for no-shows."
                    rows={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Be clear about when deposits are refunded or forfeited
                  </p>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Who can see your availability?</Label>
                  <div className="space-y-2">
                    {[
                      { value: "public", label: "Public", desc: "Anyone can see (not recommended)" },
                      { value: "verified", label: "Verified Users", desc: "Only verified users" },
                      { value: "paid", label: "Paid Requesters", desc: "Only after deposit paid" },
                      { value: "approved", label: "Approved Only", desc: "Only matches you approve" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateFormData("availabilityVisibility", option.value)}
                        className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                          formData.availabilityVisibility === option.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="font-semibold">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Next Steps:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Complete identity verification</li>
                    <li>• Set up your availability calendar</li>
                    <li>• Upload profile photos</li>
                    <li>• Review and publish your profile</li>
                  </ul>
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
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit}>
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
