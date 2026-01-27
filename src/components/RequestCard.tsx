import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, User } from "lucide-react";

export interface RequestCardProps {
  request: {
    id: string;
    approvalStatus: string;
    depositAmount: number;
    depositStatus: string;
    introMessage: string | null;
    slotId: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  otherProfile: {
    displayName: string | null;
  } | null;
  variant?: "received" | "sent";
}

export function RequestCard({ request, otherProfile, variant = "received" }: RequestCardProps) {
  const isReceived = variant === "received";
  const isPending = request.approvalStatus === "pending";
  const isApproved = request.approvalStatus === "approved";
  const isDeclined = request.approvalStatus === "declined";

  const getBadgeVariant = () => {
    if (isPending) return "secondary";
    if (isApproved) return "default";
    if (isDeclined) return "destructive";
    return "outline";
  };

  const getBadgeClassName = () => {
    if (isApproved) return "bg-green-500";
    return "";
  };

  const getTitle = () => {
    const name = otherProfile?.displayName || "Unknown";
    return isReceived ? `Request from ${name}` : `Request to ${name}`;
  };

  const getDescription = () => {
    const date = new Date(
      isPending || variant === "sent" ? request.createdAt : request.updatedAt
    ).toLocaleDateString();

    if (isReceived) {
      return isPending ? `Received ${date}` : `Approved ${date}`;
    }
    return `Sent ${date}`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              {otherProfile?.displayName ? (
                <span className="text-lg font-bold">
                  {otherProfile.displayName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <CardTitle>{getTitle()}</CardTitle>
              <CardDescription>{getDescription()}</CardDescription>
            </div>
          </div>
          <Badge variant={getBadgeVariant()} className={getBadgeClassName()}>
            {request.approvalStatus.charAt(0).toUpperCase() +
              request.approvalStatus.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {request.introMessage && isPending && isReceived && (
          <div className="text-sm text-muted-foreground">
            <p className="line-clamp-2">{request.introMessage}</p>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>${(request.depositAmount / 100).toFixed(2)} deposit</span>
          </div>
          {isReceived && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {request.slotId ? "Specific time slot" : "Flexible timing"}
              </span>
            </div>
          )}
          {variant === "sent" && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">
                Status: {request.depositStatus}
              </span>
            </div>
          )}
        </div>

        <Button
          className="w-full"
          variant={variant === "sent" ? "outline" : "default"}
          asChild
        >
          <Link href={`/inbox/${request.id}`}>
            {isPending && isReceived ? "View Request Details" : "View Details"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
