import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const dataCorrectionSchema = z.object({
  field: z.enum(["name", "email", "phone"]),
  value: z.string().min(1),
});

/**
 * POST /api/users/data-correction
 * Allow users to correct their personal data (GDPR Right to Rectification)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { field, value } = dataCorrectionSchema.parse(body);

    if (!value || value.trim().length === 0) {
      return NextResponse.json(
        { error: "Value cannot be empty" },
        { status: 400 }
      );
    }

    // Validate specific fields
    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    };
    updateData[field] = value;

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning();

    return NextResponse.json({
      success: true,
      message: `${field} updated successfully`,
      field,
      newValue: field === "email" ? value : value.substring(0, 2) + "****", // Don't return full value for privacy
    });
  } catch (error: any) {
    console.error("Data correction error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
