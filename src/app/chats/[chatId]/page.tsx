import { requireAuth } from "@/lib/session";
import { getChatById } from "@/db/queries/chats";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const session = await requireAuth();
  const { chatId } = await params;

  // Fetch chat data with messages
  const chatData = await getChatById(chatId, session.user.id);

  if (!chatData) {
    notFound();
  }

  // Determine who the other person is
  const isInvitee = chatData.request.inviteeId === session.user.id;
  const otherUser = isInvitee
    ? chatData.requesterUser
    : chatData.inviteeUser;
  const otherProfile = isInvitee
    ? chatData.requesterProfile
    : chatData.inviteeProfile;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Navigation Header */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/chats">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold text-lg">
                {otherProfile?.displayName || otherUser?.name}
              </h1>
              {otherProfile && (
                <p className="text-sm text-muted-foreground">
                  {otherProfile.age} • {otherProfile.city}
                </p>
              )}
            </div>
          </div>
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

      {/* Chat Window */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow
          chatId={chatData.chat.id}
          requestId={chatData.request.id}
          currentUserId={session.user.id}
          otherUserId={otherUser?.id || ""}
          isInvitee={isInvitee}
          requestApprovalStatus={chatData.request.approvalStatus}
          initialMessages={chatData.messages}
          otherUserName={otherProfile?.displayName || otherUser?.name || "User"}
          otherUserVerified={otherUser?.verificationStatus === "verified"}
        />
      </div>
    </div>
  );
}
