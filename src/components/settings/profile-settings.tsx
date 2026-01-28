"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ProfileSettingsProps {
  user: any;
  profile: any;
}

export function ProfileSettings({ user, profile }: ProfileSettingsProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [city, setCity] = useState(profile?.city || "");
  const [intent, setIntent] = useState(profile?.intent || "dating");
  const [boundaries, setBoundaries] = useState(profile?.boundaries || "");
  const [depositAmount, setDepositAmount] = useState(profile?.depositAmount || 50);
  const [availabilityVisibility, setAvailabilityVisibility] = useState(profile?.availabilityVisibility || "verified");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/profiles/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          bio,
          city,
          intent,
          boundaries,
          depositAmount: user.role === "invitee" || user.role === "both" ? depositAmount : undefined,
          availabilityVisibility,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setDisplayName(profile?.displayName || "");
    setBio(profile?.bio || "");
    setCity(profile?.city || "");
    setIntent(profile?.intent || "dating");
    setBoundaries(profile?.boundaries || "");
    setDepositAmount(profile?.depositAmount || 50);
    setAvailabilityVisibility(profile?.availabilityVisibility || "verified");
    setIsEditing(false);
  };

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>No profile found. Please complete your profile setup.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/onboarding">Complete Profile</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your profile details that are visible to other users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={!isEditing}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              value={profile.age}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Age cannot be changed as it must match your ID verification
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!isEditing}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={!isEditing}
              rows={4}
              maxLength={1000}
            />
            <p className="text-sm text-muted-foreground">
              {bio.length}/1000 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="intent">Dating Intent</Label>
            <Select value={intent} onValueChange={setIntent} disabled={!isEditing}>
              <SelectTrigger id="intent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dating">Dating</SelectItem>
                <SelectItem value="relationship">Relationship</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="boundaries">Boundaries & Preferences</Label>
            <Textarea
              id="boundaries"
              value={boundaries}
              onChange={(e) => setBoundaries(e.target.value)}
              disabled={!isEditing}
              rows={3}
              maxLength={500}
              placeholder="Share any boundaries or preferences for dates..."
            />
          </div>

          {(user.role === "invitee" || user.role === "both") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="depositAmount">Deposit Amount ($)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  min={10}
                  max={200}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseInt(e.target.value))}
                  disabled={!isEditing}
                />
                <p className="text-sm text-muted-foreground">
                  Amount requesters must deposit to book a date ($10-$200)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Availability Visibility</Label>
                <Select value={availabilityVisibility} onValueChange={setAvailabilityVisibility} disabled={!isEditing}>
                  <SelectTrigger id="visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can see</SelectItem>
                    <SelectItem value="verified">Verified - Only verified users</SelectItem>
                    <SelectItem value="paid">Paid - Only users with deposits</SelectItem>
                    <SelectItem value="approved">Approved - Only your approved matches</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            ) : (
              <>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Photos</CardTitle>
          <CardDescription>Manage your profile photos</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <a href="/browse">View Your Profile</a>
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Photo management is available during profile setup
          </p>
        </CardContent>
      </Card>

      {(user.role === "invitee" || user.role === "both") && (
        <Card>
          <CardHeader>
            <CardTitle>Availability Settings</CardTitle>
            <CardDescription>Manage when you're available for dates</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <a href="/browse">Manage Availability</a>
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Set your weekly schedule and date preferences
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
