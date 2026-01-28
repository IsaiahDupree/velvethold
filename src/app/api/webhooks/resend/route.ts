import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import {
  createEmailEvent,
  getEmailMessageByMessageId,
} from "@/db/queries/growth-data-plane";

/**
 * POST /api/webhooks/resend
 * Handle Resend webhook events
 *
 * Events handled:
 * - email.delivered
 * - email.opened
 * - email.clicked
 * - email.bounced
 * - email.complained
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  // Verify required webhook headers
  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("Missing required Svix headers");
    return NextResponse.json(
      { error: "Missing required webhook headers" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("RESEND_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: any;

  try {
    // Verify webhook signature using Svix
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  console.log(`Processing Resend webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case "email.delivered":
        await handleEmailDelivered(event.data);
        break;

      case "email.opened":
        await handleEmailOpened(event.data);
        break;

      case "email.clicked":
        await handleEmailClicked(event.data);
        break;

      case "email.bounced":
        await handleEmailBounced(event.data);
        break;

      case "email.complained":
        await handleEmailComplained(event.data);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle email.delivered event
 */
async function handleEmailDelivered(data: any) {
  console.log(`Email delivered: ${data.email_id}`);

  // Find the email message by Resend message ID
  const emailMessage = await getEmailMessageByMessageId(data.email_id);

  if (!emailMessage) {
    console.warn(`Email message not found for Resend ID: ${data.email_id}`);
    // Don't fail the webhook - email might not be tracked
    return;
  }

  // Store delivery event
  await createEmailEvent({
    emailMessageId: emailMessage.id,
    eventType: "delivered",
  });

  console.log(`Stored delivery event for email: ${data.email_id}`);
}

/**
 * Handle email.opened event
 */
async function handleEmailOpened(data: any) {
  console.log(`Email opened: ${data.email_id}`);

  // Find the email message by Resend message ID
  const emailMessage = await getEmailMessageByMessageId(data.email_id);

  if (!emailMessage) {
    console.warn(`Email message not found for Resend ID: ${data.email_id}`);
    return;
  }

  // Store open event
  await createEmailEvent({
    emailMessageId: emailMessage.id,
    eventType: "opened",
    userAgent: data.user_agent || undefined,
    ipAddress: data.ip_address || undefined,
  });

  // Increment email opens feature for person
  if (emailMessage.personId) {
    const { incrementPersonFeature } = await import("@/db/queries/growth-data-plane");
    await incrementPersonFeature(emailMessage.personId, "emailOpens").catch((error) => {
      console.error("Failed to increment email opens:", error);
    });
  }

  console.log(`Stored open event for email: ${data.email_id}`);
}

/**
 * Handle email.clicked event
 */
async function handleEmailClicked(data: any) {
  console.log(`Email clicked: ${data.email_id}, link: ${data.link}`);

  // Find the email message by Resend message ID
  const emailMessage = await getEmailMessageByMessageId(data.email_id);

  if (!emailMessage) {
    console.warn(`Email message not found for Resend ID: ${data.email_id}`);
    return;
  }

  // Store click event
  await createEmailEvent({
    emailMessageId: emailMessage.id,
    eventType: "clicked",
    link: data.link || undefined,
    userAgent: data.user_agent || undefined,
    ipAddress: data.ip_address || undefined,
  });

  // Increment email clicks feature for person
  if (emailMessage.personId) {
    const { incrementPersonFeature } = await import("@/db/queries/growth-data-plane");
    await incrementPersonFeature(emailMessage.personId, "emailClicks").catch((error) => {
      console.error("Failed to increment email clicks:", error);
    });
  }

  console.log(`Stored click event for email: ${data.email_id}`);
}

/**
 * Handle email.bounced event
 */
async function handleEmailBounced(data: any) {
  console.log(`Email bounced: ${data.email_id}`);

  // Find the email message by Resend message ID
  const emailMessage = await getEmailMessageByMessageId(data.email_id);

  if (!emailMessage) {
    console.warn(`Email message not found for Resend ID: ${data.email_id}`);
    return;
  }

  // Store bounce event
  await createEmailEvent({
    emailMessageId: emailMessage.id,
    eventType: "bounced",
  });

  console.log(`Stored bounce event for email: ${data.email_id}`);
}

/**
 * Handle email.complained event (spam complaints)
 */
async function handleEmailComplained(data: any) {
  console.log(`Email complained: ${data.email_id}`);

  // Find the email message by Resend message ID
  const emailMessage = await getEmailMessageByMessageId(data.email_id);

  if (!emailMessage) {
    console.warn(`Email message not found for Resend ID: ${data.email_id}`);
    return;
  }

  // Store complaint event
  await createEmailEvent({
    emailMessageId: emailMessage.id,
    eventType: "complained",
  });

  console.log(`Stored complaint event for email: ${data.email_id}`);
}
