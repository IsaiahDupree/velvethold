# Meta Pixel + CAPI Event Deduplication (GDP-010)

## Overview

This document describes the implementation of Meta Pixel and Conversions API (CAPI) event deduplication for VelvetHold. This feature ensures that events tracked both in the browser (via Pixel) and on the server (via CAPI) are not double-counted in Meta's attribution system.

## Architecture

### Event Flow

```
Browser Event
    ↓
1. Generate eventId (UUID)
    ↓
2. Fire Meta Pixel → fbq('track', eventName, params, { eventID })
    ↓
3. Send to Backend → POST /api/growth/events/track
    ↓
4. Event Service → trackMetaEvent()
    ↓
5. Store in Database → event table (with eventId)
    ↓
6. Forward to Meta CAPI → sendMetaCAPIEvent() (with same eventId)
    ↓
Meta Deduplicates using eventID
```

### Key Components

1. **Meta Pixel** (`src/components/analytics/meta-pixel.tsx`)
   - Browser-side pixel installation
   - Fires pixel events with `eventID` for deduplication
   - Automatically sends events to backend for CAPI forwarding

2. **Meta CAPI Client** (`src/lib/meta/capi.ts`)
   - Server-side event forwarding to Meta's Conversions API
   - Hashes PII data (email, phone, etc.) for privacy
   - Includes browser context (fbp, fbc cookies, IP, user agent)

3. **Event Service** (`src/lib/growth/event-service.ts`)
   - Unified event ingestion
   - Automatic CAPI forwarding for Meta events
   - Event deduplication using eventId

4. **Database Schema** (`src/db/schema.ts`)
   - Added `eventId` field to event table for tracking deduplication IDs

## Usage

### Basic Event Tracking

```typescript
import { trackMetaPixelEvent } from "@/lib/growth/analytics";

// Track a page view
trackMetaPixelEvent("PageView");

// Track a conversion with custom data
trackMetaPixelEvent("Purchase", {
  value: 99.99,
  currency: "USD",
  content_ids: ["deposit_123"],
});

// Track with explicit eventId (for custom deduplication)
trackMetaPixelEvent("Lead", {
  content_name: "Profile Created"
}, "custom-event-id-123");
```

### Server-Side Tracking Only

If you need to track an event only on the server (e.g., webhook events):

```typescript
import { trackMetaEvent } from "@/lib/growth/event-service";

await trackMetaEvent({
  eventName: "subscription_started",
  email: "user@example.com",
  fbp: user.fbpCookie,
  fbc: user.fbcCookie,
  eventId: "webhook-event-123",
  properties: {
    value: 29.99,
    currency: "USD",
  },
});
```

## Standard Event Mapping

The system automatically maps application events to Meta standard events:

| App Event | Meta Standard Event |
|-----------|-------------------|
| `landing_view` | PageView |
| `feature_preview` | ViewContent |
| `signup_complete` | CompleteRegistration |
| `profile_created` | Lead |
| `date_request_sent` | InitiateCheckout |
| `date_request_approved` | AddToCart |
| `checkout_started` | InitiateCheckout |
| `purchase_completed` | Purchase |
| `subscription_started` | Subscribe |

Custom events not in this map will be tracked as `CustomEvent`.

## Configuration

### Environment Variables

Add these to your `.env.local`:

```bash
# Meta Pixel ID (public - safe to expose)
NEXT_PUBLIC_META_PIXEL_ID=your_pixel_id_here

# Meta CAPI Access Token (secret - server-side only)
META_CAPI_ACCESS_TOKEN=your_access_token_here

# Optional: Meta Test Event Code for testing
META_CAPI_TEST_CODE=TEST12345
```

### Getting Your Credentials

1. **Pixel ID**:
   - Go to Meta Events Manager → Data Sources → Pixel
   - Copy the Pixel ID

2. **CAPI Access Token**:
   - Go to Meta Events Manager → Settings → Conversions API
   - Generate a new access token
   - Copy and store securely

3. **Test Event Code** (Optional):
   - Go to Meta Events Manager → Test Events
   - Get the test code for debugging

## Deduplication Mechanism

### How It Works

1. **Browser Event**:
   ```javascript
   fbq('track', 'Purchase', { value: 99.99 }, { eventID: 'abc-123' })
   ```

2. **Server Event** (via CAPI):
   ```json
   {
     "event_name": "Purchase",
     "event_id": "abc-123",
     "user_data": { ... },
     "custom_data": { "value": 99.99 }
   }
   ```

3. **Meta's Deduplication**:
   - Meta receives both events
   - Sees matching `eventID` = "abc-123"
   - Keeps only ONE event for attribution
   - Typically prefers CAPI event due to higher data quality

### Why Both Pixel and CAPI?

- **Pixel**: Captures browser context, cookies, on-site behavior
- **CAPI**: Bypasses ad blockers, more reliable, includes server-side data
- **Together**: Maximum event coverage + accurate attribution

## Testing

### Test in Development

1. Enable test mode in `.env.local`:
   ```bash
   META_CAPI_TEST_CODE=TEST12345
   ```

2. Fire a test event:
   ```typescript
   trackMetaPixelEvent("Purchase", {
     value: 1.00,
     currency: "USD"
   });
   ```

3. Verify in Meta Events Manager:
   - Go to Test Events tab
   - Look for your test code
   - See both Pixel and Server events
   - Verify they have matching `event_id`

### Verify Deduplication

Check the Meta Events Manager dashboard:
- Total events should equal unique events (not 2x)
- Check "Event Match Quality" score
- Verify `event_id` parameter is present

## Data Privacy

### PII Hashing

All personal identifiable information is SHA256 hashed before sending to Meta:

```typescript
// Example hashing in CAPI
{
  em: [hashValue("user@example.com")],  // SHA256 hash
  ph: [hashValue("+1234567890")],       // SHA256 hash
  fn: [hashValue("John")],               // SHA256 hash
  ln: [hashValue("Doe")]                 // SHA256 hash
}
```

### What Gets Sent

**Browser → Meta Pixel**:
- Event name and parameters
- _fbp cookie (Facebook browser ID)
- _fbc cookie (Facebook click ID)
- Page URL

**Server → Meta CAPI**:
- Event name and parameters
- Hashed email, phone, name (if available)
- Client IP address
- User agent
- fbp/fbc cookies
- Event timestamp

## Troubleshooting

### Events Not Appearing

1. **Check Pixel Installation**:
   ```bash
   # Open browser console
   fbq('getState')
   # Should show pixel ID
   ```

2. **Check CAPI Credentials**:
   - Verify `META_CAPI_ACCESS_TOKEN` is set
   - Token should have `ads_management` permission

3. **Check Server Logs**:
   ```bash
   # Look for CAPI success messages
   [Meta CAPI] Event sent: Purchase
   ```

### Events Are Duplicated

1. **Verify eventId is Present**:
   - Check database: `SELECT event_id FROM event WHERE source = 'meta'`
   - Should have UUIDs, not NULL

2. **Check Pixel Implementation**:
   ```javascript
   // Correct (with eventID)
   fbq('track', 'Purchase', {}, { eventID: 'abc-123' })

   // Wrong (no eventID)
   fbq('track', 'Purchase', {})
   ```

### Low Event Match Quality

Improve by providing more user data:
- Email (most important)
- Phone number
- First/last name
- Location data (city, state, zip, country)

## Migration Notes

### Database Migration

The `eventId` field was added to the event table:

```sql
-- Migration: 0011_skinny_jigsaw.sql
ALTER TABLE event ADD COLUMN event_id VARCHAR(255);
```

To apply:
```bash
npm run db:push
```

## Related Features

- **GDP-001**: Supabase Schema Setup
- **GDP-002**: Person & Identity Tables
- **GDP-003**: Unified Events Table
- **GDP-009**: PostHog Identity Stitching

## References

- [Meta Conversions API Documentation](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Meta Pixel Reference](https://developers.facebook.com/docs/meta-pixel/reference)
- [Event Deduplication Guide](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events)
- [PII Hashing Guidelines](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters)

## Implementation Checklist

- [x] Add `eventId` field to event table schema
- [x] Create Meta CAPI client library
- [x] Update event service to forward to CAPI
- [x] Install Meta Pixel in app layout
- [x] Implement client-side tracking with eventID
- [x] Add event mapping for standard events
- [x] Implement PII hashing
- [x] Create documentation
- [ ] Add environment variables to production
- [ ] Test in production with Meta Events Manager
- [ ] Monitor event match quality scores
