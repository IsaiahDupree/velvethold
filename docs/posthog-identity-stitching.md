# PostHog Identity Stitching (GDP-009)

## Overview

PostHog identity stitching ensures that user events are properly attributed to the canonical person ID across the Growth Data Plane. This enables unified tracking and analytics across all user touchpoints.

## Implementation

### Components Created

1. **PostHog Client Wrapper** (`src/lib/posthog.ts`)
   - Initializes PostHog SDK
   - Provides `identifyPostHogUser()` function to link PostHog events to person ID
   - Provides utility functions for tracking and identity management

2. **PostHog Provider** (`src/components/providers/posthog-provider.tsx`)
   - Initializes PostHog on app mount
   - Tracks page views on navigation

3. **PostHog Identity Sync** (`src/components/analytics/posthog-identity-sync.tsx`)
   - Automatically identifies authenticated users in PostHog
   - Links PostHog distinct_id to canonical person ID via identity service

4. **Identity API Endpoints**
   - `GET /api/growth/identity/me` - Returns person ID for authenticated user
   - `POST /api/growth/identity/link` - Links external identity to person

## How It Works

### On User Login/Signup

1. User authenticates via NextAuth.js
2. `PostHogIdentitySync` component detects authenticated session
3. Component fetches canonical person ID from `/api/growth/identity/me`
4. Calls `identifyPostHogUser(personId, traits)` to link PostHog events to person
5. Optionally links PostHog distinct_id to person table via identity service

### Identity Flow

```
User Login/Signup
       ↓
NextAuth Session Created
       ↓
PostHogIdentitySync Component
       ↓
Fetch Person ID (/api/growth/identity/me)
       ↓
posthog.identify(personId, traits)
       ↓
Link PostHog distinct_id to person (/api/growth/identity/link)
```

## Environment Variables

Add to `.env.local`:

```bash
# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Usage

### Automatic Identity Stitching

Identity stitching happens automatically when users log in or sign up. No additional code is required.

### Manual Event Tracking

```typescript
import { trackPostHogEvent } from "@/lib/posthog";

// Track custom event
trackPostHogEvent("button_clicked", {
  button_name: "premium_upgrade",
  location: "dashboard",
});
```

### Reset Identity on Logout

```typescript
import { resetPostHogIdentity } from "@/lib/posthog";

// Call this on user logout
function handleLogout() {
  resetPostHogIdentity();
  // ... rest of logout logic
}
```

## Testing

### Verify PostHog Integration

1. Set up PostHog project and get API key
2. Add credentials to `.env.local`
3. Sign up or log in to the app
4. Check PostHog dashboard for identified user events
5. Verify that events are linked to the correct person ID

### Test Identity Linking

```bash
# Check identity links in database
npm run drizzle-kit studio

# Navigate to identity_link table
# Verify that PostHog distinct_id is linked to person_id
```

## Benefits

1. **Unified User Tracking** - All PostHog events are linked to canonical person ID
2. **Cross-Platform Attribution** - Track user journey across web, email, and external platforms
3. **Privacy-Friendly** - Uses hashed person IDs for privacy compliance
4. **Automatic Sync** - Identity stitching happens automatically on login/signup

## Related Features

- GDP-002: Person & Identity Tables
- GDP-003: Unified Events Table
- GDP-010: Meta Pixel + CAPI Dedup (uses similar identity stitching pattern)
