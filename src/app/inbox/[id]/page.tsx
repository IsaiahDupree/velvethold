import { requireAuth } from "@/lib/session";
import { getRequestById, userIsInvitee } from "@/db/queries/requests";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { RequestDetail } from "@/components/RequestDetail";

interface RequestDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const session = await requireAuth();
  const { id: requestId } = await params;

  const requestData = await getRequestById(requestId);

  if (!requestData) {
    notFound();
  }

  const { request, inviteeProfile, inviteeUser, requesterProfile, requesterUser } = requestData;

  // Verify the user is part of this request
  const isInvitee = await userIsInvitee(session.user.id, requestId);
  const isRequester = request.requesterId === session.user.id;

  if (!isInvitee && !isRequester) {
    // User is not authorized to view this request
    redirect("/inbox");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
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
              <Link href="/inbox">Inbox</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/api/auth/signout">Sign Out</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/inbox" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Inbox
            </Link>
          </Button>
        </div>

        {/* Request Detail Component */}
        <RequestDetail
          request={request}
          requesterProfile={requesterProfile}
          requesterUser={requesterUser}
          inviteeProfile={inviteeProfile}
          isInvitee={isInvitee}
          onApprove={undefined}
          onDecline={undefined}
        />
      </div>
    </div>
  );
}
