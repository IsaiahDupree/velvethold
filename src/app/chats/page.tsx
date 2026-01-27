import { requireAuth } from "@/lib/session";
import { getUserChats } from "@/db/queries/chats";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function ChatsPage() {
  const session = await requireAuth();

  // Fetch all chats for the current user
  const chats = await getUserChats(session.user.id);

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
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/api/auth/signout">Sign Out</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Chat with your approved matches
          </p>
        </div>

        {/* Chats List */}
        {chats.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
              <p className="text-muted-foreground mb-4">
                Approve a date request to start chatting
              </p>
              <Button asChild>
                <Link href="/inbox">View Requests</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {chats.map((chatData) => {
              // Determine who the other person is
              const isInvitee = chatData.request.inviteeId === session.user.id;
              const otherUser = isInvitee
                ? chatData.requesterUser
                : chatData.inviteeUser;
              const otherProfile = isInvitee
                ? chatData.requesterProfile
                : chatData.inviteeProfile;

              return (
                <Link
                  key={chatData.chat.id}
                  href={`/chats/${chatData.chat.id}`}
                >
                  <Card className="hover:bg-accent transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-primary" />
                        </div>

                        {/* Chat Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-lg">
                              {otherProfile?.displayName || otherUser?.name}
                            </h3>
                            {chatData.lastMessage && (
                              <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(
                                  new Date(chatData.lastMessage.createdAt),
                                  { addSuffix: true }
                                )}
                              </span>
                            )}
                          </div>

                          {otherProfile && (
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {otherProfile.age}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {otherProfile.city}
                              </Badge>
                            </div>
                          )}

                          {chatData.lastMessage ? (
                            <p className="text-sm text-muted-foreground truncate">
                              {chatData.lastMessage.senderId === session.user.id
                                ? "You: "
                                : ""}
                              {chatData.lastMessage.content}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              No messages yet. Start the conversation!
                            </p>
                          )}
                        </div>

                        {/* Status indicator */}
                        <div className="flex items-center">
                          <MessageCircle className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
