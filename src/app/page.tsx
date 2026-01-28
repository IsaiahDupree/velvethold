"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Calendar, Lock, CheckCircle } from "lucide-react";
import { track } from "@/lib/growth/analytics";

export default function Home() {
  // Track landing view on page load
  useEffect(() => {
    track({
      eventName: "landing_view",
      properties: {
        page: "home",
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
        page: "home",
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
              <Link href="/auth/signin" onClick={() => handleCtaClick("nav_signin", "/auth/signin")}>Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup" onClick={() => handleCtaClick("nav_get_started", "/auth/signup")}>Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#3B1E4A] via-[#5A2D82] to-[#E7B7D2] py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
              Premium Date Reservations
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Filter for serious matches with deposit-based commitment. No more no-shows, no more time-wasters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="bg-white text-[#3B1E4A] hover:bg-white/90" asChild>
                <Link href="/auth/signup" onClick={() => handleCtaClick("hero_create_profile", "/auth/signup")}>Create Profile</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm" asChild>
                <Link href="#how-it-works" onClick={() => handleCtaClick("hero_how_it_works", "#how-it-works")}>How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How VelvetHold Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A simple, secure process that ensures quality matches and serious intentions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Set Your Terms</CardTitle>
                <CardDescription>
                  Create your profile, set your deposit amount, and define your availability and boundaries
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>Receive Requests</CardTitle>
                <CardDescription>
                  Interested matches pay a refundable deposit to request a date with you
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Approve & Connect</CardTitle>
                <CardDescription>
                  Review requests, approve the best matches, and chat to plan your date
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Safety First</h2>
              <p className="text-xl text-muted-foreground">
                Your security and privacy are our top priorities
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Verified Profiles</h3>
                  <p className="text-muted-foreground">
                    All users complete identity verification before accessing the platform
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Public Meetups Only</h3>
                  <p className="text-muted-foreground">
                    First dates must be in public places for everyone&apos;s safety
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Refundable Deposits</h3>
                  <p className="text-muted-foreground">
                    Deposits are held in escrow and refunded per clear cancellation policies
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Privacy Protected</h3>
                  <p className="text-muted-foreground">
                    No exact addresses or live locations shared until you approve
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join VelvetHold today and experience dating with accountability and respect
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
            <Link href="/auth/signup" onClick={() => handleCtaClick("footer_cta_create_profile", "/auth/signup")}>Create Your Profile</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">VelvetHold</h3>
              <p className="text-sm text-muted-foreground">
                Premium date reservations with deposit-based commitment
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#how-it-works" className="hover:text-foreground">How It Works</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground" onClick={() => handleCtaClick("footer_pricing", "/pricing")}>Pricing</Link></li>
                <li><Link href="/safety" className="hover:text-foreground">Safety</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/cookies" className="hover:text-foreground">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2026 VelvetHold. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
