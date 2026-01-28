import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/email";

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user details for email
    const [dbUser] = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete the user (cascades to all related data due to FK constraints)
    await db.delete(users).where(eq(users.id, user.id));

    // Send confirmation email
    try {
      await sendEmail({
        to: dbUser.email,
        subject: "Account Deleted - VelvetHold",
        html: `
          <h1>Account Deleted</h1>
          <p>Hi ${dbUser.name},</p>
          <p>Your VelvetHold account has been permanently deleted as requested.</p>
          <p>All your data including profile, messages, and photos have been removed from our servers.</p>
          <p>Any pending deposits will be refunded within 5-7 business days.</p>
          <p>We're sorry to see you go. If you have any feedback, please let us know.</p>
          <p>Best regards,<br>The VelvetHold Team</p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send deletion email:", emailError);
    }

    return NextResponse.json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
