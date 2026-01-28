"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { track } from "@/lib/growth/analytics";

export default function PricingPage() {
  // Track pricing view on page load
  useEffect(() => {
    track({
      eventName: "pricing_view",
      properties: {
        page: "pricing",
      },
    });
  }, []);

  // Track CTA clicks
  const handleCtaClick = (ctaName: string, destination: string) => {
    track({
      eventName: "cta_click",
      properties: {
        cta_name: ctaName,
        destination,
        page: "pricing",
      },
    });
  };

  return (
    <div className="min-h-screen">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            VelvetHold
          </Link>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup" onClick={() => handleCtaClick("nav_get_started", "/auth/signup")}>Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              VelvetHold is completely free to use. Set your own deposit amounts to ensure serious connections.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">For Invitees</CardTitle>
                <CardDescription>Receive date requests with deposit commitments</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold">Free</span>
                  <span className="text-muted-foreground ml-2">forever</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Set your own deposit amount</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Create detailed screening questions</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Approve or decline date requests</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Identity verification included</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>No platform fees</span>
                </div>
                <Button className="w-full mt-6" asChild>
                  <Link href="/auth/signup" onClick={() => handleCtaClick("pricing_invitee_signup", "/auth/signup")}>Create Invitee Profile</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-2xl">For Requesters</CardTitle>
                <CardDescription>Browse and request dates with deposits</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold">Free</span>
                  <span className="text-muted-foreground ml-2">forever</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Browse verified profiles</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Advanced filtering and search</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Refundable deposits (per cancellation policy)</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Direct chat with approved matches</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Identity verification required</span>
                </div>
                <Button className="w-full mt-6" asChild>
                  <Link href="/auth/signup" onClick={() => handleCtaClick("pricing_requester_signup", "/auth/signup")}>Create Requester Profile</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>How Deposits Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  <strong>Invitees</strong> set their own deposit amount (typically $25-$100) that requesters must pay to submit a date request.
                </p>
                <p>
                  <strong>Deposits are fully refundable</strong> according to our clear cancellation policy. They&apos;re held in escrow by Stripe and only released when:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The date is successfully completed (deposit returned to requester)</li>
                  <li>The invitee declines the request (deposit returned to requester)</li>
                  <li>The requester cancels within the allowed timeframe (deposit returned)</li>
                </ul>
                <p>
                  VelvetHold takes <strong>no fees</strong> from deposits. This system exists solely to ensure serious intentions and reduce no-shows.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join VelvetHold today and experience dating with accountability
            </p>
            <Button size="lg" asChild>
              <Link href="/auth/signup" onClick={() => handleCtaClick("pricing_bottom_cta", "/auth/signup")}>Create Your Profile</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
