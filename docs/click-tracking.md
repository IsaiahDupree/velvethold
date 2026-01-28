# Click Tracking & Attribution (GDP-006)

## Overview

The Click Redirect Tracker creates an attribution spine that tracks the user journey from email click through to conversion:

**email → click → session → conversion**

This enables attribution of conversions back to specific email campaigns and marketing activities.

## Architecture

### Components

1. **Click Tracking Endpoint** (`/api/track/click`)
   - Captures click events
   - Generates/maintains session IDs
   - Sets first-party cookies for attribution
   - Redirects to destination URL

2. **Click Tracking Utilities** (`src/lib/click-tracking.ts`)
   - `generateTrackedUrl()` - Creates tracked URLs for emails
   - `getAttributionFromCookies()` - Extracts attribution data
   - `trackConversionWithAttribution()` - Links conversions to campaigns

3. **Database Schema**
   - `event` table stores click events
   - `email_event` table tracks email engagement
   - Session and attribution data in event properties

## Usage

### Generate Tracked URLs for Emails

```typescript
import { generateTrackedUrl } from "@/lib/click-tracking";

// In email template
const trackedUrl = generateTrackedUrl({
  url: "https://velvethold.com/browse",
  personId: person.id,
  emailId: emailMessage.id,
  campaign: "welcome_email",
  source: "email"
});

// Use in email HTML
const html = `<a href="${trackedUrl}">Start Browsing</a>`;
```

### Track Conversions with Attribution

```typescript
import { trackConversionWithAttribution } from "@/lib/click-tracking";
import { cookies } from "next/headers";

// In a server action or API route
await trackConversionWithAttribution(
  "user_signed_up",
  {
    userId: user.id,
    plan: "premium"
  },
  cookies()
);
```

### Extract Attribution Data

```typescript
import { getAttributionFromCookies } from "@/lib/click-tracking";
import { cookies } from "next/headers";

const { sessionId, attribution } = getAttributionFromCookies(cookies());

console.log("Session ID:", sessionId);
console.log("Campaign:", attribution?.campaign);
console.log("Email ID:", attribution?.email_id);
```

## How It Works

### 1. Email Click Flow

```
User clicks email link with tracked URL
         ↓
GET /api/track/click?url=...&email_id=...&campaign=...
         ↓
Track event in database
         ↓
Set/update cookies:
  - vh_session_id (30 days)
  - vh_attribution (30 days)
         ↓
Redirect to destination URL
```

### 2. Attribution Cookies

**vh_session_id** (HttpOnly)
- Persistent session identifier
- 30-day expiration
- Used to track user across visits

**vh_attribution** (HttpOnly)
- Campaign attribution data
- Contains: source, email_id, campaign, person_id, clicked_at
- 30-day expiration
- Preserved across sessions

### 3. Event Tracking

Click events are stored in the `event` table:

```sql
INSERT INTO event (
  person_id,
  event_name,
  source,
  properties,
  session_id,
  user_agent,
  ip_address
) VALUES (
  'person-123',
  'email_link_clicked',
  'email',
  '{"destination_url": "...", "campaign": "...", "email_id": "..."}',
  'session-456',
  'Mozilla/5.0...',
  '192.168.1.1'
);
```

## Query Patterns

### Find all clicks from an email campaign

```sql
SELECT
  e.event_name,
  e.properties->>'campaign' as campaign,
  e.properties->>'destination_url' as destination,
  e.timestamp,
  p.email
FROM event e
JOIN person p ON e.person_id = p.id
WHERE e.event_name = 'email_link_clicked'
  AND e.properties->>'campaign' = 'welcome_email'
ORDER BY e.timestamp DESC;
```

### Track conversion attribution

```sql
SELECT
  e.event_name,
  e.properties->>'attribution'->>'campaign' as campaign,
  e.properties->>'attribution'->>'email_id' as email_id,
  e.timestamp,
  p.email
FROM event e
JOIN person p ON e.person_id = p.id
WHERE e.event_name = 'user_signed_up'
  AND e.properties->>'attribution' IS NOT NULL
ORDER BY e.timestamp DESC;
```

### Email to conversion funnel

```sql
WITH email_clicks AS (
  SELECT
    person_id,
    session_id,
    properties->>'email_id' as email_id,
    timestamp as click_time
  FROM event
  WHERE event_name = 'email_link_clicked'
),
conversions AS (
  SELECT
    person_id,
    session_id,
    event_name,
    timestamp as conversion_time
  FROM event
  WHERE event_name IN ('user_signed_up', 'purchase_completed')
)
SELECT
  ec.email_id,
  COUNT(DISTINCT ec.person_id) as clicks,
  COUNT(DISTINCT c.person_id) as conversions,
  ROUND(100.0 * COUNT(DISTINCT c.person_id) / COUNT(DISTINCT ec.person_id), 2) as conversion_rate
FROM email_clicks ec
LEFT JOIN conversions c ON ec.session_id = c.session_id
GROUP BY ec.email_id;
```

## Testing

### Manual Testing

1. Generate a tracked URL:
```
http://localhost:3007/api/track/click?url=http://localhost:3007/browse&campaign=test&person_id=test-123
```

2. Open in browser and verify:
   - Redirects to destination
   - Cookies are set
   - Event appears in database

3. Check database:
```sql
SELECT * FROM event
WHERE event_name = 'email_link_clicked'
ORDER BY timestamp DESC
LIMIT 1;
```

### Automated Testing

Run the test suite:
```bash
npm test tests/click-tracking.test.ts
```

## Security Considerations

1. **HttpOnly Cookies**: Session and attribution cookies are HttpOnly to prevent XSS attacks
2. **Secure in Production**: Cookies use `secure` flag in production (HTTPS only)
3. **SameSite Protection**: Cookies use `SameSite=lax` to prevent CSRF
4. **URL Validation**: Destination URLs should be validated before redirect (future enhancement)
5. **Rate Limiting**: Consider adding rate limiting to prevent abuse (future enhancement)

## Future Enhancements

1. **URL Validation**: Whitelist allowed redirect domains
2. **Bot Detection**: Filter bot traffic from analytics
3. **Link Shortening**: Optional short URLs for cleaner emails
4. **A/B Testing**: Support for variant tracking
5. **Referrer Tracking**: Capture additional referrer data
6. **Geographic Data**: Store location data for attribution
7. **Device Fingerprinting**: Enhanced cross-device tracking

## Related Features

- **GDP-004**: Resend Webhook Handler (email event tracking)
- **GDP-005**: Email Event Tracking (delivered, opened, clicked)
- **GDP-009**: PostHog Identity Stitching (cross-platform identity)
- **GDP-010**: Meta Pixel + CAPI (advertising attribution)
