# Tracking SDK Integration (TRACK-001)

## Overview

The Tracking SDK Integration feature provides a comprehensive client-side analytics system for tracking user events throughout the VelvetHold application. This forms the foundation for all event tracking features (TRACK-002 through TRACK-008) and integrates with the Growth Data Plane.

## Components

### 1. Analytics SDK (`src/lib/growth/analytics.ts`)

The core analytics SDK provides:

- **Session Management**: Automatic session creation and tracking with 30-minute timeout
- **Device Identification**: Persistent device ID stored in localStorage
- **UTM Parameter Capture**: Automatic capture and storage of marketing attribution params
- **Event Tracking API**: Simple `track()` function for custom events
- **Helper Functions**: Pre-built functions for common tracking scenarios

### 2. Analytics Init Component (`src/components/analytics/analytics-init.tsx`)

A React component that:
- Initializes the analytics SDK on app mount
- Tracks the initial page view automatically
- Sets up automatic page view tracking for SPA navigation
- Cleans up observers on unmount

## Usage

### Basic Event Tracking

```typescript
import { track } from "@/lib/growth/analytics";

// Track a custom event
await track({
  eventName: "button_clicked",
  properties: {
    buttonName: "Get Started",
    location: "landing_page",
  },
});
```

### Page View Tracking

```typescript
import { trackPageView } from "@/lib/growth/analytics";

// Manual page view tracking
await trackPageView({
  pageName: "Pricing",
  category: "marketing",
});

// Automatic tracking is already set up via AnalyticsInit
// No manual calls needed for regular navigation
```

### Click Tracking

```typescript
import { trackClick } from "@/lib/growth/analytics";

// Track button or link clicks
await trackClick("cta_button", {
  text: "Start Free Trial",
  destination: "/signup",
});
```

### Form Tracking

```typescript
import { trackFormSubmit } from "@/lib/growth/analytics";

// Track form submissions
await trackFormSubmit("contact_form", {
  fields: ["name", "email", "message"],
  success: true,
});
```

### Conversion Tracking

```typescript
import { trackConversion } from "@/lib/growth/analytics";

// Track conversion events
await trackConversion("signup_complete", {
  plan: "premium",
  source: "landing_page",
});
```

## Architecture

### Event Flow

```
User Action
    ↓
track() function called
    ↓
Add session/device ID
    ↓
Capture UTM params (if present)
    ↓
POST /api/growth/events/track
    ↓
Event Service (ingestEvent)
    ↓
Store in database
    ↓
Forward to integrations (Meta, PostHog, etc.)
```

### Session Management

- **Session ID**: Generated per browser session (30-minute timeout)
- **Device ID**: Persistent across sessions (localStorage)
- **UTM Parameters**: Captured on first page load, stored for entire session

Sessions automatically extend on activity. After 30 minutes of inactivity, a new session is created on the next interaction.

### Data Collected

For each event, the SDK automatically includes:

- `eventName`: The name of the event
- `properties`: Custom event properties (optional)
- `sessionId`: Current session identifier
- `deviceId`: Persistent device identifier
- `utmParams`: Marketing attribution parameters (if available)
- `timestamp`: Event timestamp (ISO 8601)
- `source`: Always "web" for client-side events

The API endpoint also enriches events with:
- `userAgent`: Browser user agent string
- `ipAddress`: Client IP address
- `personId`: Linked person ID (if authenticated)

## Installation

The tracking SDK is already installed and initialized in the app:

1. **SDK**: `src/lib/growth/analytics.ts` contains all tracking functions
2. **Init Component**: `src/components/analytics/analytics-init.tsx` handles initialization
3. **Layout Integration**: Component is mounted in `src/app/layout.tsx`

No additional installation steps are needed.

## API Endpoint

### POST /api/growth/events/track

Accepts event data from the analytics SDK and stores it in the database.

**Request Body:**
```json
{
  "source": "web",
  "eventName": "page_view",
  "properties": {
    "path": "/pricing",
    "title": "Pricing - VelvetHold"
  },
  "sessionId": "abc-123-def-456",
  "deviceId": "xyz-789-uvw-012",
  "utmParams": {
    "source": "google",
    "medium": "cpc",
    "campaign": "summer_2024"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event tracked successfully"
}
```

## Testing

### Manual Testing

1. Visit http://localhost:3010
2. Open browser console
3. Check for network requests to `/api/growth/events/track`
4. Navigate to different pages
5. Verify page_view events are tracked automatically

### Test Script

Run the tracking test script:

```bash
npx tsx scripts/test-tracking-sdk.ts
```

This will:
- Connect to the database
- Retrieve recent events
- Verify tracking is working
- Check data quality (session IDs, device IDs, properties)

### Expected Results

After visiting the app, you should see:
- ✓ Page view events in the database
- ✓ Session IDs attached to events
- ✓ Device IDs attached to events
- ✓ UTM parameters captured (if present in URL)
- ✓ Automatic navigation tracking

## Configuration

No additional configuration is required. The SDK works out of the box.

### Optional: Custom Event Properties

You can add custom properties to any event:

```typescript
track({
  eventName: "feature_used",
  properties: {
    featureName: "photo_upload",
    userId: currentUser.id,
    timestamp: new Date().toISOString(),
    // Any custom data you want to track
  },
});
```

## Privacy Considerations

### What We Track

- Event names and custom properties
- Session and device identifiers (anonymous UUIDs)
- Page URLs and navigation
- Marketing attribution (UTM parameters)
- Browser metadata (user agent, IP address)

### What We DON'T Track

- Personal information (unless explicitly passed in properties)
- Password or payment data
- Private messages or conversations
- Sensitive profile information

### User Identity

The SDK tracks anonymous users by default. User identity is linked when:
1. User signs up or logs in
2. Identity service links session/device ID to person record
3. Future events are associated with the identified user

## Next Steps

Now that TRACK-001 is complete, you can implement specific event tracking:

- **TRACK-002**: Acquisition events (landing_view, cta_click, pricing_view)
- **TRACK-003**: Activation events (signup_start, login_success, activation_complete)
- **TRACK-004**: Core value events (profile_created, request_sent, date_confirmed)
- **TRACK-005**: Monetization events (checkout_started, purchase_completed)
- **TRACK-006**: Retention events (return_session, feature_usage)
- **TRACK-007**: Error and performance tracking
- **TRACK-008**: User identification on login

## Related Features

- **GDP-003**: Unified Events Table (data storage)
- **GDP-009**: PostHog Identity Stitching (identity resolution)
- **GDP-010**: Meta Pixel + CAPI Deduplication (cross-platform tracking)
- **META-001 to META-008**: Meta Pixel event tracking

## Troubleshooting

### Events Not Appearing

1. **Check browser console**: Look for errors in network requests
2. **Verify API endpoint**: Make sure `/api/growth/events/track` is accessible
3. **Check database connection**: Ensure DATABASE_URL is configured
4. **Review server logs**: Check for errors in event ingestion

### Session Not Persisting

1. **Check sessionStorage**: Verify `analytics_session_id` is set
2. **Check timeout**: Sessions expire after 30 minutes of inactivity
3. **Private browsing**: May affect sessionStorage behavior

### Device ID Issues

1. **Check localStorage**: Verify `analytics_device_id` is set
2. **Private browsing**: localStorage may not persist
3. **Clear data**: Device ID resets if localStorage is cleared

## Support

For issues or questions about the tracking SDK:
1. Check the source code in `src/lib/growth/analytics.ts`
2. Review API endpoint at `src/app/api/growth/events/track/route.ts`
3. Test using `scripts/test-tracking-sdk.ts`
4. Check database events table for stored data
