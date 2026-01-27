import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

/**
 * POST /api/webhooks/persona
 * Handle Persona webhook events
 *
 * Events handled:
 * - inquiry.completed
 * - inquiry.approved
 * - inquiry.declined
 * - inquiry.failed
 * - inquiry.expired
 */
export async function POST(request: NextRequest) {
  const body = await request.text();

  // Get webhook signature from headers
  const signature = request.headers.get("persona-signature");

  if (!signature) {
    console.error("Missing persona-signature header");
    return NextResponse.json(
      { error: "Missing persona-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.PERSONA_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("PERSONA_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  try {
    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature, webhookSecret);

    if (!isValid) {
      console.error("Webhook signature verification failed");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Webhook signature verification error:", error);
    return NextResponse.json(
      { error: "Signature verification failed" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch (error) {
    console.error("Invalid JSON in webhook body:", error);
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const eventType = event.data?.type;
  console.log(`Processing Persona webhook event: ${eventType}`);

  try {
    switch (eventType) {
      case "inquiry.completed": {
        await handleInquiryCompleted(event);
        break;
      }

      case "inquiry.approved": {
        await handleInquiryApproved(event);
        break;
      }

      case "inquiry.declined": {
        await handleInquiryDeclined(event);
        break;
      }

      case "inquiry.failed": {
        await handleInquiryFailed(event);
        break;
      }

      case "inquiry.expired": {
        await handleInquiryExpired(event);
        break;
      }

      default:
        console.log(`Unhandled Persona event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Persona webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Verify the webhook signature using HMAC SHA256
 */
function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    // If buffers are different lengths, they're not equal
    return false;
  }
}

/**
 * Handle inquiry.completed event
 * This is fired when the user completes the verification flow
 */
async function handleInquiryCompleted(event: any) {
  const inquiry = event.data;
  const referenceId = inquiry.attributes?.["reference-id"];

  if (!referenceId) {
    console.error("No reference-id found in inquiry.completed event");
    return;
  }

  console.log(`Inquiry completed for user: ${referenceId}`);

  // Update user verification status to pending if not already approved/declined
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, referenceId))
    .limit(1);

  if (user && user.verificationStatus === "unverified") {
    await db
      .update(users)
      .set({
        verificationStatus: "pending",
        updatedAt: new Date(),
      })
      .where(eq(users.id, referenceId));

    console.log(`Updated user ${referenceId} verification status to pending`);
  }
}

/**
 * Handle inquiry.approved event
 * This is fired when Persona approves the verification
 */
async function handleInquiryApproved(event: any) {
  const inquiry = event.data;
  const referenceId = inquiry.attributes?.["reference-id"];

  if (!referenceId) {
    console.error("No reference-id found in inquiry.approved event");
    return;
  }

  console.log(`Inquiry approved for user: ${referenceId}`);

  // Update user verification status to verified
  await db
    .update(users)
    .set({
      verificationStatus: "verified",
      updatedAt: new Date(),
    })
    .where(eq(users.id, referenceId));

  console.log(`Updated user ${referenceId} verification status to verified`);
}

/**
 * Handle inquiry.declined event
 * This is fired when Persona declines the verification
 */
async function handleInquiryDeclined(event: any) {
  const inquiry = event.data;
  const referenceId = inquiry.attributes?.["reference-id"];

  if (!referenceId) {
    console.error("No reference-id found in inquiry.declined event");
    return;
  }

  console.log(`Inquiry declined for user: ${referenceId}`);

  // Update user verification status back to unverified
  await db
    .update(users)
    .set({
      verificationStatus: "unverified",
      updatedAt: new Date(),
    })
    .where(eq(users.id, referenceId));

  console.log(`Updated user ${referenceId} verification status to unverified (declined)`);
}

/**
 * Handle inquiry.failed event
 * This is fired when the verification fails for technical reasons
 */
async function handleInquiryFailed(event: any) {
  const inquiry = event.data;
  const referenceId = inquiry.attributes?.["reference-id"];

  if (!referenceId) {
    console.error("No reference-id found in inquiry.failed event");
    return;
  }

  console.log(`Inquiry failed for user: ${referenceId}`);

  // Update user verification status back to unverified
  await db
    .update(users)
    .set({
      verificationStatus: "unverified",
      updatedAt: new Date(),
    })
    .where(eq(users.id, referenceId));

  console.log(`Updated user ${referenceId} verification status to unverified (failed)`);
}

/**
 * Handle inquiry.expired event
 * This is fired when an inquiry expires without completion
 */
async function handleInquiryExpired(event: any) {
  const inquiry = event.data;
  const referenceId = inquiry.attributes?.["reference-id"];

  if (!referenceId) {
    console.error("No reference-id found in inquiry.expired event");
    return;
  }

  console.log(`Inquiry expired for user: ${referenceId}`);

  // Update user verification status back to unverified
  await db
    .update(users)
    .set({
      verificationStatus: "unverified",
      updatedAt: new Date(),
    })
    .where(eq(users.id, referenceId));

  console.log(`Updated user ${referenceId} verification status to unverified (expired)`);
}
