"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreVertical, Flag, Ban, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatMessageActionsProps {
  otherUserId: string;
  otherUserName: string;
  chatId: string;
}

export function ChatMessageActions({
  otherUserId,
  otherUserName,
  chatId,
}: ChatMessageActionsProps) {
  const router = useRouter();
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [reportType, setReportType] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReport = async () => {
    if (!reportType || !reportDescription.trim()) {
      alert("Please select a report type and provide a description");
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
          reportedUserId: otherUserId,
          reportType,
          description: reportDescription,
          context: "chat",
          contextId: chatId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit report");
      }

      alert("Report submitted successfully. Our team will review it shortly.");
      setShowReportDialog(false);
      setReportType("");
      setReportDescription("");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert(error instanceof Error ? error.message : "Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlock = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blockedUserId: otherUserId,
          reason: blockReason.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to block user");
      }

      alert(`${otherUserName} has been blocked. You will no longer receive messages from them.`);
      setShowBlockDialog(false);
      setBlockReason("");

      // Redirect to chat list
      router.push("/chats");
    } catch (error) {
      console.error("Error blocking user:", error);
      alert(error instanceof Error ? error.message : "Failed to block user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
            <Flag className="h-4 w-4 mr-2" />
            Report User
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowBlockDialog(true)}
            className="text-destructive"
          >
            <Ban className="h-4 w-4 mr-2" />
            Block User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {otherUserName}</DialogTitle>
            <DialogDescription>
              Please provide details about why you're reporting this user. Our moderation team will review your report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="inappropriate_behavior">Inappropriate Behavior</SelectItem>
                  <SelectItem value="fake_profile">Fake Profile</SelectItem>
                  <SelectItem value="scam">Scam or Fraud</SelectItem>
                  <SelectItem value="offensive_content">Offensive Content</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-description">Description</Label>
              <Textarea
                id="report-description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Please describe what happened..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReportDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleReport} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Block {otherUserName}?
            </DialogTitle>
            <DialogDescription>
              Blocking this user will prevent them from messaging you. You won't see their messages and they won't be able to send you new date requests.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="block-reason">Reason (optional)</Label>
              <Textarea
                id="block-reason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Why are you blocking this user?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBlockDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBlock}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Blocking..." : "Block User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
