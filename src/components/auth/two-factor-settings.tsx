"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TwoFactorSettingsProps {
  isEnabled: boolean;
  onStatusChange?: (enabled: boolean) => void;
}

export function TwoFactorSettings({ isEnabled: initialEnabled, onStatusChange }: TwoFactorSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const { toast } = useToast();

  const handleSetupStart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to setup 2FA");
      }

      setQrCode(data.qrCode);
      setSecret(data.secret);
      setShowSetupDialog(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to setup 2FA",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySetup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const token = formData.get("token") as string;

    try {
      const response = await fetch("/api/auth/2fa/verify-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify token");
      }

      setBackupCodes(data.backupCodes);
      setShowBackupCodes(true);
      setShowSetupDialog(false);
      setIsEnabled(true);
      onStatusChange?.(true);

      toast({
        title: "Success",
        description: "Two-factor authentication has been enabled",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify token",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const token = formData.get("token") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to disable 2FA");
      }

      setShowDisableDialog(false);
      setIsEnabled(false);
      onStatusChange?.(false);

      toast({
        title: "Success",
        description: "Two-factor authentication has been disabled",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to disable 2FA",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by enabling two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Status: <span className={isEnabled ? "text-green-600" : "text-muted-foreground"}>
                  {isEnabled ? "Enabled" : "Disabled"}
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isEnabled
                  ? "Your account is protected with 2FA"
                  : "Enable 2FA to secure your account"}
              </p>
            </div>
            {isEnabled ? (
              <Button
                variant="destructive"
                onClick={() => setShowDisableDialog(true)}
                disabled={isLoading}
              >
                Disable 2FA
              </Button>
            ) : (
              <Button onClick={handleSetupStart} disabled={isLoading}>
                Enable 2FA
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {qrCode && (
              <div className="flex justify-center">
                <img src={qrCode} alt="QR Code" className="w-64 h-64" />
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Or enter this code manually:
              </p>
              <code className="block bg-muted p-2 rounded text-sm break-all">
                {secret}
              </code>
            </div>
            <form onSubmit={handleVerifySetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Enter the 6-digit code from your app</Label>
                <Input
                  id="token"
                  name="token"
                  type="text"
                  placeholder="000000"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  disabled={isLoading}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSetupDialog(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify & Enable"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Backup Codes</DialogTitle>
            <DialogDescription>
              Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded space-y-2">
              {backupCodes.map((code, index) => (
                <div key={index} className="font-mono text-sm">
                  {code}
                </div>
              ))}
            </div>
            <Button
              onClick={() => {
                const text = backupCodes.join("\n");
                navigator.clipboard.writeText(text);
                toast({
                  title: "Copied",
                  description: "Backup codes copied to clipboard",
                });
              }}
              className="w-full"
            >
              Copy Backup Codes
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowBackupCodes(false)}>
              I&apos;ve Saved My Codes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your password and a 2FA code to disable two-factor authentication
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDisable} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disable-token">2FA Code</Label>
              <Input
                id="disable-token"
                name="token"
                type="text"
                placeholder="000000"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                disabled={isLoading}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDisableDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isLoading}>
                {isLoading ? "Disabling..." : "Disable 2FA"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
