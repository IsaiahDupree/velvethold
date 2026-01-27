"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Heart, Calendar, Clock, Shield, AlertCircle, Flag } from "lucide-react";
import { ReportModal } from "@/components/ReportModal";
import { BlockButton } from "@/components/BlockButton";

export interface ProfileDetailProps {
  profile: {
    id: string;
    userId?: string;
    displayName: string;
    age: number;
    city: string;
    bio?: string | null;
    intent?: string | null;
    datePreferences?: unknown;
    boundaries?: string | null;
    screeningQuestions?: unknown;
    depositAmount?: number | null;
    cancellationPolicy?: string | null;
    availabilityVisibility?: string | null;
    createdAt?: Date | null;
  };
  showRequestButton?: boolean;
  showReportButton?: boolean;
  showBlockButton?: boolean;
  onRequestDate?: () => void;
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function ProfileDetail({ profile, showRequestButton = true, showReportButton = true, showBlockButton = true, onRequestDate }: ProfileDetailProps) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const datePreferences = isRecord(profile.datePreferences) ? profile.datePreferences : null;
  const screeningQuestions = isRecord(profile.screeningQuestions) ? profile.screeningQuestions : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <div className="text-8xl font-bold text-primary/40">
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              <div>
                <CardTitle className="text-3xl mb-2">
                  {profile.displayName}, {profile.age}
                </CardTitle>
                <CardDescription className="space-y-2">
                  <div className="flex items-center gap-2 text-base">
                    <MapPin className="h-5 w-5" />
                    {profile.city}
                  </div>
                  {profile.intent && (
                    <div className="flex items-center gap-2 text-base">
                      <Heart className="h-5 w-5" />
                      Looking for: {profile.intent.charAt(0).toUpperCase() + profile.intent.slice(1)}
                    </div>
                  )}
                </CardDescription>
              </div>

              {/* Deposit Amount Badge */}
              {profile.depositAmount && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Deposit: ${(profile.depositAmount / 100).toFixed(2)}
                  </Badge>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {showRequestButton && onRequestDate && (
                  <Button size="lg" className="w-full md:w-auto" onClick={onRequestDate}>
                    Request a Date
                  </Button>
                )}
                {showReportButton && profile.userId && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full md:w-auto"
                    onClick={() => setIsReportModalOpen(true)}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </Button>
                )}
                {showBlockButton && profile.userId && (
                  <BlockButton
                    userId={profile.userId}
                    userName={profile.displayName}
                    variant="outline"
                    size="lg"
                    className="w-full md:w-auto"
                  />
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Bio Section */}
      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Date Preferences Section */}
      {datePreferences && Object.keys(datePreferences).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Date Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(datePreferences).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="font-medium capitalize min-w-32">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className="text-muted-foreground">
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Boundaries Section */}
      {profile.boundaries && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Boundaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{profile.boundaries}</p>
          </CardContent>
        </Card>
      )}

      {/* Screening Questions Section */}
      {screeningQuestions && Object.keys(screeningQuestions).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Screening Questions
            </CardTitle>
            <CardDescription>
              These questions must be answered when requesting a date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(screeningQuestions).map(([key, value], index) => (
                <div key={key} className="space-y-1">
                  <p className="font-medium">
                    {index + 1}. {String(value)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancellation Policy Section */}
      {profile.cancellationPolicy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Cancellation Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{profile.cancellationPolicy}</p>
          </CardContent>
        </Card>
      )}

      {/* Availability Visibility Info */}
      {profile.availabilityVisibility && (
        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Visible to: {profile.availabilityVisibility.charAt(0).toUpperCase() + profile.availabilityVisibility.slice(1)} users
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Modal */}
      {profile.userId && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          reportedUserId={profile.userId}
          reportedUserName={profile.displayName}
          context="profile"
          contextId={profile.id}
        />
      )}
    </div>
  );
}
