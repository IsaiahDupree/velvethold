import { Resend } from "resend"
import { createEmailMessage } from "@/db/queries/growth-data-plane"
import { generateTrackedUrl } from "./click-tracking"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailParams {
  to: string
  subject: string
  html: string
  personId?: string
  tags?: Record<string, any>
  template?: string
  campaign?: string // For click tracking
}

/**
 * Send an email using Resend and log to database
 */
export async function sendEmail({ to, subject, html, personId, tags, template, campaign }: EmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: "VelvetHold <noreply@velvethold.com>",
      to,
      subject,
      html,
    })

    if (error) {
      console.error("Error sending email:", error)
      return { success: false, error }
    }

    // Store email message in database for webhook tracking
    if (data?.id) {
      try {
        await createEmailMessage({
          personId: personId || undefined,
          messageId: data.id,
          subject,
          template: template || undefined,
          tags: {
            ...tags,
            ...(campaign && { campaign }),
          },
        })
        console.log(`Email message logged: ${data.id}`)
      } catch (dbError) {
        // Don't fail the email send if database logging fails
        console.error("Error logging email to database:", dbError)
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(email: string, token: string, personId?: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VelvetHold</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for signing up for VelvetHold! Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p>&copy; 2026 VelvetHold. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: "Verify your VelvetHold email address",
    html,
    personId,
    template: "email_verification",
    tags: { type: "transactional", category: "auth" },
  })
}

/**
 * Send welcome email after successful verification
 * Note: Links use direct URLs. For tracked URLs, wrap with generateTrackedUrl() in the future.
 */
export async function sendWelcomeEmail(email: string, name: string, personId?: string) {
  // Generate base URLs (can be enhanced with click tracking in future iterations)
  const browseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/browse`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to VelvetHold!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Welcome to VelvetHold, the premium dating platform where serious intentions meet genuine connections.</p>
            <p>We're excited to have you join our community. Here's what you can do next:</p>
            <ul>
              <li>Complete your profile to make a great first impression</li>
              <li>Browse profiles and discover amazing people</li>
              <li>Send date requests to people who interest you</li>
            </ul>
            <a href="${browseUrl}" class="button">Start Browsing</a>
          </div>
          <div class="footer">
            <p>&copy; 2026 VelvetHold. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: "Welcome to VelvetHold!",
    html,
    personId,
    template: "welcome",
    campaign: "welcome_email",
    tags: { type: "transactional", category: "onboarding" },
  })
}

/**
 * Send notification when a date request is received
 */
export async function sendRequestReceivedEmail(
  email: string,
  recipientName: string,
  requesterName: string,
  personId?: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Date Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${recipientName},</h2>
            <p><strong>${requesterName}</strong> has sent you a date request on VelvetHold!</p>
            <p>They've made a refundable deposit to show their serious intentions. Review their profile and decide if you'd like to accept.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/inbox" class="button">View Request</a>
          </div>
          <div class="footer">
            <p>&copy; 2026 VelvetHold. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `New date request from ${requesterName}`,
    html,
    personId,
    template: "request_received",
    tags: { type: "notification", category: "request" },
  })
}

/**
 * Send notification when a date request is approved
 */
export async function sendRequestApprovedEmail(
  email: string,
  requesterName: string,
  inviteeName: string,
  personId?: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Request Approved!</h1>
          </div>
          <div class="content">
            <h2>Hi ${requesterName},</h2>
            <p>Great news! <strong>${inviteeName}</strong> has approved your date request.</p>
            <p>You can now start chatting and plan your date together. Your deposit will be held until the date is confirmed.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/chat" class="button">Start Chatting</a>
          </div>
          <div class="footer">
            <p>&copy; 2026 VelvetHold. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `${inviteeName} approved your date request!`,
    html,
    personId,
    template: "request_approved",
    tags: { type: "notification", category: "request" },
  })
}

/**
 * Send notification when a date request is declined
 */
export async function sendRequestDeclinedEmail(
  email: string,
  requesterName: string,
  inviteeName: string,
  personId?: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Request Update</h1>
          </div>
          <div class="content">
            <h2>Hi ${requesterName},</h2>
            <p><strong>${inviteeName}</strong> has declined your date request.</p>
            <p>Your deposit has been fully refunded. Don't worry - there are many other great people on VelvetHold!</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/browse" class="button">Keep Browsing</a>
          </div>
          <div class="footer">
            <p>&copy; 2026 VelvetHold. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: "Date request update",
    html,
    personId,
    template: "request_declined",
    tags: { type: "notification", category: "request" },
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string, personId?: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
          </div>
          <div class="footer">
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <p>&copy; 2026 VelvetHold. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: "Reset your VelvetHold password",
    html,
    personId,
    template: "password_reset",
    tags: { type: "transactional", category: "auth" },
  })
}

/**
 * Send notification when a date is confirmed
 */
export async function sendDateConfirmedEmail(
  email: string,
  userName: string,
  partnerName: string,
  dateDetails: {
    location: string
    time: string
    date: string
  },
  personId?: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .date-details { background-color: white; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Date Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>Your date with <strong>${partnerName}</strong> has been confirmed!</p>
            <div class="date-details">
              <h3>Date Details:</h3>
              <p><strong>Date:</strong> ${dateDetails.date}</p>
              <p><strong>Time:</strong> ${dateDetails.time}</p>
              <p><strong>Location:</strong> ${dateDetails.location}</p>
            </div>
            <p>Your deposit will be released after the date is completed. Have a wonderful time!</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/chat" class="button">View Chat</a>
          </div>
          <div class="footer">
            <p>&copy; 2026 VelvetHold. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `Your date with ${partnerName} is confirmed!`,
    html,
    personId,
    template: "date_confirmed",
    tags: { type: "notification", category: "date" },
  })
}
