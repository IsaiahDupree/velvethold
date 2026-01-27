import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/photos - Get user's photos
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.userId, user.id))
      .orderBy(desc(photos.isPrimary), photos.order);

    return NextResponse.json({ photos: userPhotos });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

// POST /api/photos - Upload a photo
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const isPrimary = formData.get("isPrimary") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `velvethold/users/${user.id}`,
            transformation: [
              { width: 1000, height: 1000, crop: "limit" },
              { quality: "auto" },
              { fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    // If this is set as primary, unset all other primary photos
    if (isPrimary) {
      await db
        .update(photos)
        .set({ isPrimary: false })
        .where(eq(photos.userId, user.id));
    }

    // Get the next order number
    const existingPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.userId, user.id));

    const nextOrder = existingPhotos.length;

    // Save photo record to database
    const [photo] = await db
      .insert(photos)
      .values({
        userId: user.id,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        isPrimary: isPrimary || existingPhotos.length === 0, // First photo is always primary
        order: nextOrder,
      })
      .returning();

    return NextResponse.json({ photo });
  } catch (error) {
    console.error("Error uploading photo:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}

// DELETE /api/photos - Delete all photos
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all user photos
    const userPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.userId, user.id));

    // Delete from Cloudinary
    for (const photo of userPhotos) {
      await cloudinary.uploader.destroy(photo.publicId);
    }

    // Delete from database
    await db.delete(photos).where(eq(photos.userId, user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photos:", error);
    return NextResponse.json(
      { error: "Failed to delete photos" },
      { status: 500 }
    );
  }
}
