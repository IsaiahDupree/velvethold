import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertCircle
} from "lucide-react";

export interface RequestDetailProps {
  request: {
    id: string;
    approvalStatus: string;
    depositAmount: number;
    depositStatus: string;
    introMessage: string | null;
    screeningAnswers: unknown;
    slotId: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  requesterProfile?: {
    displayName: string | null;
    age: number | null;
    city: string | null;
    bio: string | null;
  } | null;
  requesterUser?: {
    email: string;
  } | null;
  inviteeProfile?: {
    displayName: string | null;
    screeningQuestions: unknown;
  } | null;
  isInvitee: boolean;
  onApprove?: () => void;
  onDecline?: () => void;
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function RequestDetail({
  request,
  requesterProfile,
  requesterUser,
  inviteeProfile,
  isInvitee,
  onApprove,
  onDecline
}: RequestDetailProps) {
  const isPending = request.approvalStatus === "pending";
  const isApproved = request.approvalStatus === "approved";
  const isDeclined = request.approvalStatus === "declined";

  const screeningAnswers = isRecord(request.screeningAnswers) ? request.screeningAnswers : null;
  const screeningQuestions = isRecord(inviteeProfile?.screeningQuestions)
    ? inviteeProfile.screeningQuestions
    : null;

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div>
              <CardTitle className="text-3xl mb-2">Date Request</CardTitle>
              <CardDescription>
                Submitted {new Date(request.createdAt).toLocaleDateString()} at{" "}
                {new Date(request.createdAt).toLocaleTimeString()}
              </CardDescription>
            </div>
            <Badge variant={getBadgeVariant()} className={`text-lg px-4 py-2 ${getBadgeClassName()}`}>
              {request.approvalStatus.charAt(0).toUpperCase() + request.approvalStatus.slice(1)}
            </Badge>
          </div>

          <Separator />

          <div className="pt-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                {requesterProfile?.displayName ? (
                  <span className="text-2xl font-bold">
                    {requesterProfile.displayName.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {requesterProfile?.displayName || "Unknown User"}
                </h3>
                {requesterProfile?.age && requesterProfile?.city && (
                  <p className="text-muted-foreground">
                    {requesterProfile.age} • {requesterProfile.city}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Intro Message Section */}
      {request.introMessage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {request.introMessage}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Requester Bio Section */}
      {requesterProfile?.bio && (
        <Card>
          <CardHeader>
            <CardTitle>About {requesterProfile.displayName}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {requesterProfile.bio}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Screening Answers Section */}
      {screeningAnswers && screeningQuestions && Object.keys(screeningAnswers).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Screening Answers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(screeningAnswers).map(([key, answer]) => {
                const question = screeningQuestions[key];
                return (
                  <div key={key} className="space-y-2">
                    <p className="font-medium text-sm">
                      {question ? String(question) : `Question ${key}`}
                    </p>
                    <p className="text-muted-foreground pl-4">
                      {String(answer)}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Deposit Amount</p>
                <p className="font-semibold">
                  ${(request.depositAmount / 100).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Timing</p>
                <p className="font-semibold">
                  {request.slotId ? "Specific time slot" : "Flexible timing"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Deposit Status</p>
                <p className="font-semibold capitalize">
                  {request.depositStatus}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-semibold">
                  {new Date(request.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons - Only show for invitee on pending requests */}
      {isInvitee && isPending && onApprove && onDecline && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Take Action</CardTitle>
            <CardDescription>
              Review the request details and decide whether to approve or decline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={onApprove}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Approve Request
              </Button>
              <Button
                size="lg"
                variant="destructive"
                className="flex-1"
                onClick={onDecline}
              >
                <XCircle className="h-5 w-5 mr-2" />
                Decline Request
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Messages */}
      {isApproved && (
        <Card className="border-2 border-green-500/20 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  Request Approved
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  You can now proceed to coordinate your date details via chat
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isDeclined && (
        <Card className="border-2 border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6 text-destructive" />
              <div>
                <p className="font-semibold">Request Declined</p>
                <p className="text-sm text-muted-foreground">
                  This request has been declined
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
