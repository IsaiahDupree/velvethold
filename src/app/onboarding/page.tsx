import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Heart } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3B1E4A]/5 via-[#5A2D82]/5 to-[#E7B7D2]/5 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-primary">
            VelvetHold
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">Choose Your Path</h1>
          <p className="text-muted-foreground">
            How would you like to use VelvetHold?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <UserCircle className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">I&apos;m an Invitee</CardTitle>
              <CardDescription className="text-base">
                Set your terms, receive date requests, and approve the matches you like
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Set your deposit amount and availability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Review requests from verified matches</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Control who you meet and when</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Filter for serious intentions only</span>
                </li>
              </ul>
              <Button className="w-full" size="lg" asChild>
                <Link href="/onboarding/invitee">Continue as Invitee</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-secondary transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-secondary" />
              </div>
              <CardTitle className="text-2xl">I&apos;m a Requester</CardTitle>
              <CardDescription className="text-base">
                Browse profiles, send date requests, and connect with quality matches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">✓</span>
                  <span>Browse verified invitee profiles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">✓</span>
                  <span>Send requests with refundable deposits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">✓</span>
                  <span>Show your serious intentions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">✓</span>
                  <span>Connect with matches who value commitment</span>
                </li>
              </ul>
              <Button className="w-full" size="lg" variant="secondary" asChild>
                <Link href="/onboarding/requester">Continue as Requester</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          You can switch roles or use both at any time in your settings
        </p>
      </div>
    </div>
  );
}
