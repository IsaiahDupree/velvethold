import { requireAuth } from "@/lib/session";
import { listUserRequests } from "@/db/queries/requests";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Inbox, Heart, DollarSign, Calendar, User } from "lucide-react";

export default async function InboxPage() {
  const session = await requireAuth();

  // Fetch requests where the current user is the invitee (received requests)
  const receivedRequests = await listUserRequests(session.user.id, {
    asInvitee: true,
  });

  // Fetch requests where the current user is the requester (sent requests)
  const sentRequests = await listUserRequests(session.user.id, {
    asRequester: true,
  });

  const pendingReceived = receivedRequests.filter(
    (r) => r.request.approvalStatus === "pending"
  );
  const approvedReceived = receivedRequests.filter(
    (r) => r.request.approvalStatus === "approved"
  );
  const declinedReceived = receivedRequests.filter(
    (r) => r.request.approvalStatus === "declined"
  );

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
          <h1 className="text-4xl font-bold mb-2">Request Inbox</h1>
          <p className="text-muted-foreground">
            Manage your incoming and outgoing date requests
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReceived.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedReceived.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sent Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sentRequests.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Inbox className="h-6 w-6" />
            Pending Requests
            {pendingReceived.length > 0 && (
              <Badge variant="default">{pendingReceived.length}</Badge>
            )}
          </h2>

          {pendingReceived.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                <p className="text-muted-foreground">
                  You're all caught up! New date requests will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingReceived.map(({ request, requesterProfile, requesterUser }) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          {requesterProfile?.displayName ? (
                            <span className="text-lg font-bold">
                              {requesterProfile.displayName.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <User className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <CardTitle>
                            Request from {requesterProfile?.displayName || "Unknown"}
                          </CardTitle>
                          <CardDescription>
                            Received{" "}
                            {new Date(request.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p className="line-clamp-2">{request.introMessage}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${(request.depositAmount / 100).toFixed(2)} deposit</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {request.slotId ? "Specific time slot" : "Flexible timing"}
                        </span>
                      </div>
                    </div>

                    <Button className="w-full" asChild>
                      <Link href={`/inbox/${request.id}`}>View Request Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Approved Requests Section */}
        {approvedReceived.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Heart className="h-6 w-6" />
              Approved Requests
              <Badge variant="outline">{approvedReceived.length}</Badge>
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {approvedReceived.map(({ request, requesterProfile, requesterUser }) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          {requesterProfile?.displayName ? (
                            <span className="text-lg font-bold">
                              {requesterProfile.displayName.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <User className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <CardTitle>
                            Request from {requesterProfile?.displayName || "Unknown"}
                          </CardTitle>
                          <CardDescription>
                            Approved{" "}
                            {new Date(request.updatedAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-500">
                        Approved
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${(request.depositAmount / 100).toFixed(2)} deposit</span>
                      </div>
                    </div>

                    <Button className="w-full" asChild>
                      <Link href={`/inbox/${request.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Sent Requests Section */}
        {sentRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Sent Requests
              <Badge variant="outline" className="ml-2">
                {sentRequests.length}
              </Badge>
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {sentRequests.map(({ request, inviteeProfile, inviteeUser }) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <span className="text-lg font-bold">
                            {inviteeProfile?.displayName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <CardTitle>
                            Request to {inviteeProfile?.displayName || "Unknown"}
                          </CardTitle>
                          <CardDescription>
                            Sent {new Date(request.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={
                          request.approvalStatus === "pending"
                            ? "secondary"
                            : request.approvalStatus === "approved"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {request.approvalStatus.charAt(0).toUpperCase() +
                          request.approvalStatus.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${(request.depositAmount / 100).toFixed(2)} deposit</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">
                          Status: {request.depositStatus}
                        </span>
                      </div>
                    </div>

                    <Button className="w-full" variant="outline" asChild>
                      <Link href={`/inbox/${request.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
