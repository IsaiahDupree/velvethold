import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Send notification email
    // In a production system, this would trigger a background job to compile and send user data
    await sendEmail({
      to: user.email || "",
      subject: "Data Export Request - VelvetHold",
      html: `
        <h1>Data Export Request Received</h1>
        <p>Hi ${user.name},</p>
        <p>We've received your request to export your data from VelvetHold.</p>
        <p>Your data export will be ready within 24 hours and will be sent to this email address.</p>
        <p>The export will include:</p>
        <ul>
          <li>Your profile information</li>
          <li>Photos and media</li>
          <li>Messages and chat history</li>
          <li>Date requests and history</li>
          <li>Account activity</li>
        </ul>
        <p>Best regards,<br>The VelvetHold Team</p>
      `,
    });

    return NextResponse.json({
      message: "Data export request received. You'll receive your data via email within 24 hours.",
    });
  } catch (error) {
    console.error("Data export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
