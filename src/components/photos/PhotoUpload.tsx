"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, Star } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

interface PhotoUploadProps {
  initialPhotos?: Photo[];
  maxPhotos?: number;
  minPhotos?: number;
  onPhotosChange?: (photos: Photo[]) => void;
}

export default function PhotoUpload({
  initialPhotos = [],
  maxPhotos = 6,
  minPhotos = 2,
  onPhotosChange,
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      setError(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith("image/")) {
          setError("Please select only image files");
          continue;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError("Each photo must be less than 5MB");
          continue;
        }

        // Upload to API
        const formData = new FormData();
        formData.append("file", file);
        formData.append("isPrimary", photos.length === 0 ? "true" : "false");

        const response = await fetch("/api/photos", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to upload photo");
        }

        const { photo } = await response.json();
        const newPhotos = [...photos, photo];
        setPhotos(newPhotos);
        onPhotosChange?.(newPhotos);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (photoId: string) => {
    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete photo");
      }

      const newPhotos = photos.filter((p) => p.id !== photoId);
      setPhotos(newPhotos);
      onPhotosChange?.(newPhotos);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete photo");
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPrimary: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to set primary photo");
      }

      const { photo: updatedPhoto } = await response.json();
      const newPhotos = photos.map((p) => ({
        ...p,
        isPrimary: p.id === photoId,
      }));
      setPhotos(newPhotos);
      onPhotosChange?.(newPhotos);
    } catch (err) {
      console.error("Set primary error:", err);
      setError("Failed to set primary photo");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Profile Photos</h3>
          <p className="text-sm text-muted-foreground">
            Upload {minPhotos}-{maxPhotos} photos. Your first photo will be your primary photo.
          </p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || photos.length >= maxPhotos}
          variant="outline"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Uploading..." : "Upload Photo"}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <Card key={photo.id} className="relative overflow-hidden group">
            <img
              src={photo.url}
              alt="Profile photo"
              className="w-full aspect-square object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {!photo.isPrimary && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleSetPrimary(photo.id)}
                >
                  <Star className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(photo.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {photo.isPrimary && (
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Primary
              </div>
            )}
          </Card>
        ))}

        {photos.length < maxPhotos && (
          <Card
            className="aspect-square flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors border-dashed"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center p-4">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {photos.length === 0 ? "Upload your first photo" : "Add more photos"}
              </p>
            </div>
          </Card>
        )}
      </div>

      {photos.length < minPhotos && (
        <p className="text-sm text-muted-foreground">
          Please upload at least {minPhotos} photos to continue.
        </p>
      )}
    </div>
  );
}
