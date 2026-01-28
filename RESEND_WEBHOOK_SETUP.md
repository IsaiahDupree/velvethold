# Resend Webhook Setup Guide

## Overview
This document describes the Resend webhook integration for tracking email engagement events (delivered, opened, clicked, bounced, complained).

## Implementation Status
✅ **COMPLETE** - GDP-004: Resend Webhook Edge Function

### What Was Implemented

1. **Webhook Handler** (`/api/webhooks/resend/route.ts`)
   - Svix signature verification
   - Event type handling: `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`, `email.complained`
   - Maps Resend message IDs to database email_message records
   - Stores engagement events in email_event table

2. **Email Logging** (Enhanced `src/lib/email.ts`)
   - `sendEmail()` now logs all sent emails to `email_message` table
   - Captures Resend message ID for webhook correlation
   - Supports optional `personId` for user attribution
   - Tags emails with template name and metadata

3. **Environment Variables**
   - `RESEND_API_KEY` - Existing Resend API key
   - `RESEND_WEBHOOK_SECRET` - New webhook signing secret (added to .env.example and .env.local)

## Setup Instructions

### 1. Configure Resend Webhook

In your Resend dashboard (https://resend.com/webhooks):

1. Create a new webhook
2. Set the endpoint URL: `https://your-domain.com/api/webhooks/resend`
3. Select events to track:
   - ✅ email.delivered
   - ✅ email.opened
   - ✅ email.clicked
   - ✅ email.bounced
   - ✅ email.complained
4. Copy the webhook signing secret
5. Add to your `.env.local` and production environment:
   ```bash
   RESEND_WEBHOOK_SECRET=whsec_...
   ```

### 2. Test Webhook Locally

For local development, use a tunnel service like ngrok:

```bash
# Start ngrok tunnel
ngrok http 3000

# Configure Resend webhook with ngrok URL
# https://your-ngrok-url.ngrok.io/api/webhooks/resend
```

### 3. Verify Email Tracking

```bash
# Check email messages are being logged
SELECT * FROM email_message ORDER BY sent_at DESC LIMIT 10;

# Check email events after webhook delivery
SELECT em.subject, ee.event_type, ee.timestamp, ee.link
FROM email_event ee
JOIN email_message em ON ee.email_message_id = em.id
ORDER BY ee.timestamp DESC
LIMIT 20;
```

## Email Templates with Tracking

All email helper functions now support tracking:

```typescript
// Verification email with person tracking
await sendVerificationEmail(
  email,
  token,
  personId  // Optional: Maps to person table
);

// Request notification with tracking
await sendRequestReceivedEmail(
  email,
  recipientName,
  requesterName,
  personId  // Optional
);
```

## Event Types

| Event Type | Description | Tracked Data |
|------------|-------------|--------------|
| `delivered` | Email successfully delivered to inbox | Basic event |
| `opened` | Recipient opened the email | User agent, IP address |
| `clicked` | Recipient clicked a link | Link URL, user agent, IP |
| `bounced` | Email bounced | Basic event |
| `complained` | Recipient marked as spam | Basic event |

## Database Schema

### email_message table
```sql
- id: UUID (primary key)
- person_id: UUID (nullable, references person table)
- message_id: VARCHAR (Resend message ID, unique)
- subject: VARCHAR
- template: VARCHAR (e.g., "email_verification", "welcome")
- tags: JSONB (metadata like {type: "transactional", category: "auth"})
- sent_at: TIMESTAMP
```

### email_event table
```sql
- id: UUID (primary key)
- email_message_id: UUID (references email_message)
- event_type: ENUM (delivered, opened, clicked, bounced, complained, unsubscribed)
- link: VARCHAR (for click events)
- user_agent: TEXT
- ip_address: VARCHAR
- timestamp: TIMESTAMP (auto-generated)
```

## Security

- **Svix Verification**: All webhook requests are verified using Svix signatures
- **Secret Management**: Webhook secret stored in environment variables, never committed to code
- **Failed Verification**: Returns 400 Bad Request for invalid signatures

## Monitoring

### Check webhook logs
```bash
# View webhook processing logs
tail -f /path/to/logs | grep "Resend webhook"
```

### Common errors
1. "Missing required webhook headers" - Svix headers not present (check Resend webhook config)
2. "Invalid signature" - Webhook secret mismatch (verify RESEND_WEBHOOK_SECRET)
3. "Email message not found" - Email wasn't logged before webhook fired (rare race condition)

## Next Steps (GDP-005 & GDP-006)

The webhook foundation is now in place for:
- **GDP-005**: Email Event Tracking - ✅ Implemented as part of GDP-004
- **GDP-006**: Click Redirect Tracker - Track email → click → session → conversion attribution

## Testing

```bash
# Test endpoint exists
curl -X POST http://localhost:3000/api/webhooks/resend

# Expected response without headers:
# {"error":"Missing required webhook headers"}

# Actual webhook test requires valid Svix signature from Resend
```

## Production Checklist

- [ ] Set RESEND_WEBHOOK_SECRET in production environment
- [ ] Configure Resend webhook with production URL
- [ ] Verify webhook events are being received
- [ ] Monitor email_event table for incoming events
- [ ] Set up alerts for high bounce/complaint rates
- [ ] Review email tracking in growth analytics dashboard

## Files Modified/Created

### New Files
- `/src/app/api/webhooks/resend/route.ts` - Webhook handler

### Modified Files
- `/src/lib/email.ts` - Added email logging and tracking
- `/.env.example` - Added RESEND_WEBHOOK_SECRET
- `/.env.local` - Added RESEND_WEBHOOK_SECRET for dev

### Existing Infrastructure (No Changes Needed)
- `/src/db/schema.ts` - email_message and email_event tables (from GDP-001)
- `/src/db/queries/growth-data-plane.ts` - Query helpers (from GDP-001)
