# Growth Data Plane - Event Tracking System

This directory contains the unified event tracking system for the VelvetHold Growth Data Plane.

## Overview

The event tracking system provides a unified way to track user behavior across multiple sources:
- **Web**: Browser-based events (page views, clicks, form submissions)
- **App**: Server-side app events (profile creation, requests, etc.)
- **Email**: Email engagement events (opens, clicks)
- **Stripe**: Payment and subscription events
- **Booking**: Date request lifecycle events
- **Meta**: Facebook Pixel and Conversions API events

## Architecture

### Components

1. **Event Service** (`event-service.ts`)
   - Core event ingestion logic
   - Person ID resolution from different sources
   - Type-safe event definitions

2. **Identity Service** (`identity-service.ts`)
   - Unified person identity management
   - Cross-platform identity stitching
   - Maps external IDs to canonical person records

3. **Analytics Client** (`analytics.ts`)
   - Browser-side tracking utilities
   - Session and device ID management
   - UTM parameter capture and attribution

4. **API Endpoints**
   - `POST /api/growth/events/track` - Universal event ingestion endpoint
   - `GET /api/growth/events/track` - Retrieve user events
   - `POST /api/growth/identity/sync` - Sync app users to person table

## Usage Examples

### Web Tracking (Client-Side)

```typescript
import { track, trackPageView, trackClick } from '@/lib/growth/analytics';

// Initialize analytics (in root layout)
useEffect(() => {
  const cleanup = initAnalytics();
  return cleanup;
}, []);

// Track custom events
await track({
  eventName: 'signup_started',
  properties: {
    source: 'landing_page',
    plan: 'pro'
  }
});

// Track page views (automatic with initAnalytics)
await trackPageView({
  source: 'navigation'
});

// Track clicks
await trackClick('cta_button', {
  buttonText: 'Get Started'
});
```

### Server-Side Tracking

```typescript
import { trackAppEvent, trackBookingEvent } from '@/lib/growth/event-service';

// Track app events
await trackAppEvent({
  eventName: 'profile_completed',
  userId: user.id,
  properties: {
    role: user.role,
    hasPhoto: true
  }
});

// Track booking events
await trackBookingEvent({
  eventName: 'request_created',
  userId: requester.id,
  requestId: request.id,
  properties: {
    depositAmount: request.depositAmount,
    inviteeId: request.inviteeId
  }
});
```

### Email Tracking

```typescript
import { trackEmailEvent } from '@/lib/growth/event-service';

// Track email events (from webhook handler)
await trackEmailEvent({
  eventName: 'email_opened',
  email: recipient.email,
  messageId: webhookData.messageId,
  properties: {
    campaign: 'welcome_series',
    template: 'welcome_day_1'
  }
});
```

### Stripe Events

```typescript
import { trackStripeEvent } from '@/lib/growth/event-service';

// Track payment events
await trackStripeEvent({
  eventName: 'payment_succeeded',
  stripeCustomerId: customer.id,
  properties: {
    amount: paymentIntent.amount,
    currency: paymentIntent.currency
  }
});
```

### Direct API Usage

```typescript
// POST to the API endpoint
const response = await fetch('/api/growth/events/track', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    source: 'web',
    eventName: 'conversion',
    properties: {
      conversionType: 'signup',
      value: 99.99
    },
    utmParams: {
      source: 'google',
      medium: 'cpc',
      campaign: 'brand'
    }
  })
});
```

## Event Schema

### Standard Event Properties

All events include:
- `eventName`: String identifier for the event
- `source`: Enum of event source (web|app|email|stripe|booking|meta)
- `properties`: JSONB object with event-specific data
- `timestamp`: Automatic timestamp
- `personId`: Resolved canonical person ID
- `sessionId`: Session identifier (for web events)
- `deviceId`: Device identifier (for web events)
- `userAgent`: Browser/client user agent
- `ipAddress`: Request IP address

### Recommended Event Names

**Acquisition**
- `landing_view` - User lands on homepage
- `cta_click` - Call-to-action clicked
- `pricing_view` - Pricing page viewed

**Activation**
- `signup_started` - Signup form opened
- `signup_completed` - Account created
- `login_success` - User logged in
- `activation_complete` - Profile setup completed

**Core Value**
- `profile_created` - User created profile
- `request_created` - Date request created
- `request_approved` - Request approved by invitee
- `chat_message_sent` - Message sent in chat
- `date_confirmed` - Both parties confirmed date

**Monetization**
- `checkout_started` - Payment flow initiated
- `payment_succeeded` - Payment completed
- `payment_failed` - Payment failed
- `subscription_created` - Subscription started
- `subscription_renewed` - Subscription renewed
- `subscription_canceled` - Subscription canceled

**Retention**
- `return_session` - User returned within 7 days
- `returning_user` - User returned after 30+ days

## Identity Resolution

The system automatically resolves person IDs from:
- **App Users**: Via `app` provider in `identity_link` table
- **Email**: Via email address in `person` table
- **Stripe**: Via `stripe` provider in `identity_link` table
- **Meta**: Via `meta` provider in `identity_link` table

Example identity flow:
1. User signs up → Person record created with email
2. User ID linked to person via `identity_link` (provider: 'app')
3. Stripe customer created → Linked to person (provider: 'stripe')
4. Events from any source automatically resolve to the same person

## Session & Device Tracking

The analytics client automatically manages:
- **Session ID**: 30-minute timeout, stored in sessionStorage
- **Device ID**: Persistent across sessions, stored in localStorage
- **UTM Parameters**: Captured on first page view, persisted for session

## Testing

Run tests with:
```bash
npm test -- src/lib/growth/__tests__/event-service.test.ts
```

## Database Schema

Events are stored in the `event` table with the following structure:
- `id`: UUID primary key
- `person_id`: Reference to canonical person
- `event_name`: Event identifier
- `source`: Event source enum
- `properties`: JSONB event data
- `timestamp`: Event timestamp
- `session_id`, `device_id`, `user_agent`, `ip_address`: Tracking metadata

## Next Steps (GDP-004 onwards)

1. **Resend Webhook Integration** (GDP-004, GDP-005)
   - Parse Resend webhooks
   - Store email events
   - Link emails to person records

2. **PostHog Integration** (GDP-009)
   - Call `posthog.identify()` on login/signup
   - Forward events to PostHog for product analytics

3. **Meta CAPI** (GDP-010)
   - Deduplicate browser and server events
   - Send high-value events to Meta for optimization

4. **Feature Computation** (GDP-011)
   - Compute person features from events
   - Use for segmentation and automation

5. **Segment Engine** (GDP-012)
   - Evaluate segment membership
   - Trigger automations based on segments
