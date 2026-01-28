"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Star } from "lucide-react";
import Image from "next/image";

interface Photo {
  id: string;
  url: string;
  publicId: string;
  isPrimary: boolean;
  order: number;
}

export function PhotoManager() {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch("/api/photos");
      if (!response.ok) {
        throw new Error("Failed to fetch photos");
      }
      const data = await response.json();
      setPhotos(data.photos || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load photos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("isPrimary", photos.length === 0 ? "true" : "false");

      const response = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload photo");
      }

      const data = await response.json();
      setPhotos([...photos, data.photo]);

      toast({
        title: "Photo uploaded",
        description: "Your photo has been uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to set primary photo");
      }

      // Update local state
      setPhotos(
        photos.map((p) => ({
          ...p,
          isPrimary: p.id === photoId,
        }))
      );

      toast({
        title: "Primary photo updated",
        description: "Your primary photo has been set",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set primary photo",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete photo");
      }

      setPhotos(photos.filter((p) => p.id !== photoId));

      toast({
        title: "Photo deleted",
        description: "Your photo has been deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Photos</CardTitle>
          <CardDescription>Loading your photos...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Photos</CardTitle>
        <CardDescription>
          Manage your profile photos. Your primary photo will be displayed on your profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors"
            >
              <Image
                src={photo.url}
                alt="Profile photo"
                fill
                className="object-cover"
              />
              {photo.isPrimary && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Primary
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!photo.isPrimary && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSetPrimary(photo.id)}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Set Primary
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(photo.id)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}

          {photos.length < 6 && (
            <label className="relative aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 bg-muted/30 hover:bg-muted/50">
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={isUploading}
                className="hidden"
              />
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground text-center px-2">
                {isUploading ? "Uploading..." : "Upload Photo"}
              </span>
            </label>
          )}
        </div>

        {photos.length === 0 && (
          <p className="text-sm text-muted-foreground">
            You haven&apos;t uploaded any photos yet. Upload at least one photo to complete your profile.
          </p>
        )}

        {photos.length >= 6 && (
          <p className="text-sm text-muted-foreground">
            You&apos;ve reached the maximum of 6 photos. Delete a photo to upload a new one.
          </p>
        )}

        <div className="text-sm text-muted-foreground space-y-1">
          <p>Photo requirements:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Maximum file size: 5MB</li>
            <li>Supported formats: JPG, PNG, GIF, WebP</li>
            <li>Recommended: Square images (1:1 aspect ratio)</li>
            <li>Maximum 6 photos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
