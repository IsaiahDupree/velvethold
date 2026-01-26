import { requireAuth } from "@/lib/session";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, MessageSquare } from "lucide-react";

export default async function RequestSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAuth();
  const params = await searchParams;
  const requestId = typeof params.requestId === "string" ? params.requestId : undefined;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            VelvetHold
          </Link>
          <div className="flex gap-4 items-center">
            <Button variant="ghost" asChild>
              <Link href="/browse">Browse</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/api/auth/signout">Sign Out</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-3xl">Request Sent Successfully!</CardTitle>
              <CardDescription className="text-base">
                Your date request has been submitted and payment processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold">What happens next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">1.</span>
                    <span>The person will review your request and screening answers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">2.</span>
                    <span>You will be notified when they respond to your request</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">3.</span>
                    <span>If approved, you can start chatting to plan your date</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">4.</span>
                    <span>Your deposit is held securely and will be refunded according to the cancellation policy</span>
                  </li>
                </ul>
              </div>

              {requestId && (
                <div className="text-sm text-muted-foreground text-center">
                  Request ID: <span className="font-mono">{requestId}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="flex-1">
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/browse">
                    Continue Browsing
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
