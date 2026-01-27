import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// PATCH /api/photos/[photoId] - Update photo (set as primary or reorder)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { photoId } = await params;
    const body = await request.json();

    // Verify photo belongs to user
    const [photo] = await db
      .select()
      .from(photos)
      .where(and(eq(photos.id, photoId), eq(photos.userId, user.id)))
      .limit(1);

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // If setting as primary, unset all other primary photos
    if (body.isPrimary) {
      await db
        .update(photos)
        .set({ isPrimary: false })
        .where(eq(photos.userId, user.id));
    }

    // Update photo
    const [updatedPhoto] = await db
      .update(photos)
      .set({
        ...(body.isPrimary !== undefined && { isPrimary: body.isPrimary }),
        ...(body.order !== undefined && { order: body.order }),
      })
      .where(eq(photos.id, photoId))
      .returning();

    return NextResponse.json({ photo: updatedPhoto });
  } catch (error) {
    console.error("Error updating photo:", error);
    return NextResponse.json(
      { error: "Failed to update photo" },
      { status: 500 }
    );
  }
}

// DELETE /api/photos/[photoId] - Delete a specific photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { photoId } = await params;

    // Verify photo belongs to user
    const [photo] = await db
      .select()
      .from(photos)
      .where(and(eq(photos.id, photoId), eq(photos.userId, user.id)))
      .limit(1);

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(photo.publicId);

    // Delete from database
    await db.delete(photos).where(eq(photos.id, photoId));

    // If this was the primary photo, set another photo as primary
    if (photo.isPrimary) {
      const [nextPhoto] = await db
        .select()
        .from(photos)
        .where(eq(photos.userId, user.id))
        .limit(1);

      if (nextPhoto) {
        await db
          .update(photos)
          .set({ isPrimary: true })
          .where(eq(photos.id, nextPhoto.id));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
