import { requireAuth } from "@/lib/session";
import { VerificationFlow } from "@/components/verification/verification-flow";

export default async function VerificationPage() {
  const session = await requireAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Identity Verification</h1>
            <p className="text-lg text-muted-foreground">
              Verify your identity to access all features and build trust with other members
            </p>
          </div>

          <VerificationFlow
            userId={session.user.id}
            currentStatus={session.user.verificationStatus}
          />
        </div>
      </div>
    </div>
  );
}
