"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Info, Check, Clock } from "lucide-react";
import { format } from "date-fns";

interface DateConfirmationStatus {
  hasProposedDetails: boolean;
  inviteeConfirmed: boolean;
  requesterConfirmed: boolean;
  bothConfirmed: boolean;
  dateConfirmedAt: Date | null;
  confirmedDateTime: Date | null;
  confirmedLocation: string | null;
  confirmedDetails: string | null;
}

interface DateConfirmationCardProps {
  requestId: string;
  isInvitee: boolean;
  onUpdate?: () => void;
}

export function DateConfirmationCard({
  requestId,
  isInvitee,
  onUpdate,
}: DateConfirmationCardProps) {
  const [status, setStatus] = useState<DateConfirmationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProposing, setIsProposing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Form state for proposing date details
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");

  // Fetch confirmation status
  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/requests/${requestId}/confirmation-status`);
      if (!response.ok) {
        throw new Error("Failed to fetch confirmation status");
      }
      const data = await response.json();
      setStatus(data.status);
    } catch (error) {
      console.error("Error fetching confirmation status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [requestId]);

  const handleProposeDate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateTime || !location) {
      alert("Please fill in date/time and location");
      return;
    }

    try {
      setIsProposing(true);
      const response = await fetch(`/api/requests/${requestId}/propose-date`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateTime,
          location,
          details,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to propose date details");
      }

      await fetchStatus();
      onUpdate?.();

      // Reset form
      setDateTime("");
      setLocation("");
      setDetails("");
    } catch (error) {
      console.error("Error proposing date:", error);
      alert("Failed to propose date details. Please try again.");
    } finally {
      setIsProposing(false);
    }
  };

  const handleConfirmDate = async () => {
    try {
      setIsConfirming(true);
      const response = await fetch(`/api/requests/${requestId}/confirm-date`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to confirm date");
      }

      await fetchStatus();
      onUpdate?.();
    } catch (error) {
      console.error("Error confirming date:", error);
      alert("Failed to confirm date. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center justify-center">
          <Clock className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (!status) {
    return null;
  }

  // Both parties confirmed - show success state
  if (status.bothConfirmed && status.confirmedDateTime && status.confirmedLocation) {
    return (
      <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950 dark:to-green-900 dark:border-green-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-500 rounded-full">
            <Check className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1 text-green-900 dark:text-green-100">
              Date Confirmed!
            </h3>
            <p className="text-sm text-green-700 dark:text-green-200 mb-4">
              Both parties have confirmed the date details.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-green-700 dark:text-green-300" />
                <span className="font-medium">
                  {format(new Date(status.confirmedDateTime), "PPPp")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-green-700 dark:text-green-300" />
                <span className="font-medium">{status.confirmedLocation}</span>
              </div>
              {status.confirmedDetails && (
                <div className="flex items-start gap-2 text-sm mt-2">
                  <Info className="h-4 w-4 text-green-700 dark:text-green-300 mt-0.5" />
                  <span className="text-green-700 dark:text-green-200">
                    {status.confirmedDetails}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Date details proposed but not fully confirmed
  if (status.hasProposedDetails && status.confirmedDateTime && status.confirmedLocation) {
    const userHasConfirmed = isInvitee ? status.inviteeConfirmed : status.requesterConfirmed;
    const otherHasConfirmed = isInvitee ? status.requesterConfirmed : status.inviteeConfirmed;

    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary rounded-full">
            <Calendar className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">Date Details Proposed</h3>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {format(new Date(status.confirmedDateTime), "PPPp")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{status.confirmedLocation}</span>
              </div>
              {status.confirmedDetails && (
                <div className="flex items-start gap-2 text-sm mt-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">{status.confirmedDetails}</span>
                </div>
              )}
            </div>

            {userHasConfirmed ? (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {otherHasConfirmed
                    ? "Both parties confirmed! Finalizing..."
                    : "You've confirmed. Waiting for the other person to confirm."}
                </p>
              </div>
            ) : (
              <Button
                onClick={handleConfirmDate}
                disabled={isConfirming}
                className="w-full"
              >
                {isConfirming ? "Confirming..." : "Confirm Date Details"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // No date details proposed yet - show proposal form
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary rounded-full">
          <Calendar className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">Confirm Date Details</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Propose a date, time, and location for your date.
          </p>

          <form onSubmit={handleProposeDate} className="space-y-4">
            <div>
              <Label htmlFor="dateTime">Date & Time</Label>
              <Input
                id="dateTime"
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Coffee Shop on Main St"
                required
              />
            </div>

            <div>
              <Label htmlFor="details">Additional Details (Optional)</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Any additional information..."
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={isProposing}
              className="w-full"
            >
              {isProposing ? "Proposing..." : "Propose Date Details"}
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
}
