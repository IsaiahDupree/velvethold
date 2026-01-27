"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUserName?: string;
  context?: "request" | "chat" | "profile";
  contextId?: string;
}

const reportTypes = [
  { value: "harassment", label: "Harassment or bullying" },
  { value: "inappropriate_behavior", label: "Inappropriate behavior" },
  { value: "fake_profile", label: "Fake or misleading profile" },
  { value: "scam", label: "Scam or fraud" },
  { value: "offensive_content", label: "Offensive content" },
  { value: "other", label: "Other" },
];

export function ReportModal({
  isOpen,
  onClose,
  reportedUserId,
  reportedUserName,
  context,
  contextId,
}: ReportModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportType) {
      toast({
        title: "Error",
        description: "Please select a report type",
        variant: "destructive",
      });
      return;
    }

    if (description.length < 20) {
      toast({
        title: "Error",
        description: "Please provide more details (at least 20 characters)",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportedUserId,
          reportType,
          description,
          context,
          contextId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit report");
      }

      toast({
        title: "Report submitted",
        description:
          "Thank you for your report. We'll review it and take appropriate action.",
      });

      // Reset form
      setReportType("");
      setDescription("");
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReportType("");
      setDescription("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Report User</DialogTitle>
            <DialogDescription>
              {reportedUserName
                ? `Report ${reportedUserName} for violating community guidelines`
                : "Report this user for violating community guidelines"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Reason for report</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="reportType">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Please provide details about what happened (minimum 20 characters)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/2000 characters
                {description.length < 20 &&
                  ` (${20 - description.length} more required)`}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
