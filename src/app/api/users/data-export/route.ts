import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/db";
import {
  users,
  profiles,
  dateRequests,
  messages,
  chats,
  reports,
  blocks,
  photos,
} from "@/db/schema";
import { eq, or } from "drizzle-orm";

/**
 * GET /api/users/data-export
 * Export user's personal data in machine-readable format (GDPR/CCPA compliance)
 * Returns JSON with all user data, profile, requests, messages, photos, etc.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user record
    const [userData] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get profile
    const [profileData] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    // Get photos
    const photoData = await db
      .select()
      .from(photos)
      .where(eq(photos.userId, user.id));

    // Get date requests (both as requester and invitee)
    const requestsData = await db
      .select()
      .from(dateRequests)
      .where(
        or(
          eq(dateRequests.requesterId, user.id),
          eq(dateRequests.inviteeId, user.id)
        )
      );

    // Get chats (via date requests where user is involved)
    const chatsData = await db
      .select()
      .from(chats)
      .innerJoin(dateRequests, eq(chats.requestId, dateRequests.id))
      .where(
        or(
          eq(dateRequests.requesterId, user.id),
          eq(dateRequests.inviteeId, user.id)
        )
      )
      .then((result) => result.map((r) => r.chats));

    // Get messages sent by user
    const messagesData = await db
      .select()
      .from(messages)
      .where(eq(messages.senderId, user.id));

    // Get blocks
    const blocksData = await db
      .select()
      .from(blocks)
      .where(
        or(eq(blocks.blockerId, user.id), eq(blocks.blockedUserId, user.id))
      );

    // Get reports filed by user
    const reportsFiledByUser = await db
      .select()
      .from(reports)
      .where(eq(reports.reporterId, user.id));

    // Get reports against user
    const reportsAgainstUser = await db
      .select()
      .from(reports)
      .where(eq(reports.reportedUserId, user.id));

    // Compile export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        verificationStatus: userData.verificationStatus,
        accountStatus: userData.accountStatus,
        twoFactorEnabled: userData.twoFactorEnabled,
        tosAcceptedAt: userData.tosAcceptedAt,
        tosVersion: userData.tosVersion,
        privacyAcceptedAt: userData.privacyAcceptedAt,
        privacyVersion: userData.privacyVersion,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
      profile: profileData || null,
      photos: photoData,
      dateRequests: requestsData,
      chats: chatsData,
      messages: messagesData,
      blocks: blocksData,
      reports: {
        filedByUser: reportsFiledByUser,
        filedAgainstUser: reportsAgainstUser,
      },
      metadata: {
        totalDateRequests: requestsData.length,
        totalMessages: messagesData.length,
        totalPhotos: photoData.length,
        totalBlocks: blocksData.length,
        totalReportsFiled: reportsFiledByUser.length,
        totalReportsAgainst: reportsAgainstUser.length,
      },
    };

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="velvethold-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Data export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
