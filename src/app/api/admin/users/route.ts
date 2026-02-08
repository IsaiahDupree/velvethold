import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { eq, like, or, and } from "drizzle-orm";
import { z } from "zod";

const updateUserStatusSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(["active", "flagged", "suspended", "banned"]),
  reason: z.string().optional(),
});

/**
 * GET /api/admin/users
 * Fetch users for admin review and management
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Check if user is admin
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "all";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build conditions
    const conditions: any[] = [];
    if (statusFilter !== "all") {
      conditions.push(eq(users.accountStatus, statusFilter as any));
    }
    if (search) {
      conditions.push(like(users.email, `%${search}%`));
    }

    // Execute query with conditions
    let usersData: any;
    if (conditions.length > 0) {
      usersData = await db
        .select()
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(and(...conditions))
        .limit(limit)
        .offset(offset);
    } else {
      usersData = await db
        .select()
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .limit(limit)
        .offset(offset);
    }

    return NextResponse.json({
      success: true,
      users: usersData,
      count: usersData.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users
 * Update user account status
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Check if user is admin
    const body = await request.json();
    const { userId, status, reason } = updateUserStatusSchema.parse(body);

    // Get the user
    const [userData] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user status
    await db
      .update(users)
      .set({
        accountStatus: status as any,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: `User ${status === "banned" ? "banned" : status === "suspended" ? "suspended" : "status updated"} successfully`,
      userId,
      newStatus: status,
      reason: reason || null,
    });
  } catch (error: any) {
    console.error("User update error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
