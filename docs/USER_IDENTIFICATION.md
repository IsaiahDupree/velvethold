# User Identification (TRACK-008)

## Overview

The User Identification feature automatically identifies authenticated users in the analytics system, associating all subsequent events with user traits such as email, role, and account status.

## Components

### 1. Client-side `identify()` Function

**Location:** `src/lib/growth/analytics.ts`

The `identify()` function allows tracking a user's identity with custom traits:

```typescript
import { identify } from "@/lib/growth/analytics";

// Identify a user with traits
await identify(userId, {
  email: "user@example.com",
  name: "John Doe",
  role: "requester",
  plan: "premium",
  // ... any other traits
});
```

**Features:**
- Tracks a `user_identified` event
- Associates traits with the user
- Includes session and device IDs
- Handles errors gracefully (won't break the app)

### 2. UserIdentitySync Component

**Location:** `src/components/analytics/user-identity-sync.tsx`

This component automatically identifies users when they log in:

- Monitors authentication session changes
- Calls `identify()` once per session
- Includes default traits:
  - Email
  - Name
  - Role (invitee/requester/both)
  - Verification status
  - Account status

**Integration:** Mounted in `src/app/layout.tsx` alongside other analytics components.

### 3. Backend Identity Sync

**Location:** `src/lib/growth/identity-service.ts`

The `identifyUser()` function syncs authenticated users to the canonical person table:

- Called on signup (in `/api/auth/signup/route.ts`)
- Called on login (in `src/lib/auth.ts`)
- Creates or updates person records
- Links app user IDs to canonical person IDs
- Updates person traits

## How It Works

### Client-Side Flow

1. User logs in
2. `SessionProvider` updates with user session
3. `UserIdentitySync` component detects authenticated session
4. Calls `identify(userId, traits)` once
5. Sends `user_identified` event to `/api/growth/events/track`
6. Event is ingested and associated with the person

### Server-Side Flow

1. User signs up or logs in
2. `identifyUser()` is called with user ID and traits
3. User data is synced to the `person` table
4. App user ID is linked to canonical person ID via `identity_link` table
5. Person traits are updated with latest data

## Event Properties

The `user_identified` event includes:

```typescript
{
  eventName: "user_identified",
  userId: "user-uuid",
  properties: {
    email: "user@example.com",
    name: "John Doe",
    role: "requester",
    verificationStatus: "verified",
    accountStatus: "active",
    identifiedAt: "2026-01-28T04:00:00.000Z"
  },
  sessionId: "session-uuid",
  deviceId: "device-uuid",
  source: "web"
}
```

## Testing

### Manual Testing

1. Start the dev server: `npm run dev`
2. Open the browser and navigate to the signup page
3. Create a new account
4. Check the browser console for the identify event
5. Check the database `event` table for the `user_identified` event

### Using the Test Script

Create a test script at `scripts/test-user-identification.ts`:

```typescript
import { identify } from "@/lib/growth/analytics";

async function testUserIdentification() {
  // Simulate identifying a user
  await identify("test-user-id", {
    email: "test@example.com",
    name: "Test User",
    role: "requester",
  });

  console.log("✓ User identified successfully");
}

testUserIdentification();
```

Run with: `tsx scripts/test-user-identification.ts`

## Database Schema

### Events Table

User identification events are stored in the `event` table:

- `personId`: UUID reference to the canonical person
- `eventName`: "user_identified"
- `source`: "web" | "app"
- `properties`: JSONB with user traits
- `sessionId`, `deviceId`: For session tracking
- `userId`: App user ID (from `identity_link`)

### Person Table

User traits are stored in the `person` table:

- `id`: Canonical person ID
- `email`: User email
- `name`: User name
- `traits`: JSONB with additional user properties

## Integration Points

### 1. Authentication Flow

- Signup: `/api/auth/signup/route.ts` (line 57)
- Login: `src/lib/auth.ts` (line 87)

### 2. Client-Side Analytics

- Layout: `src/app/layout.tsx` (line 36)
- Identity Sync: `src/components/analytics/user-identity-sync.tsx`

### 3. Growth Data Plane

- Event Ingestion: `/api/growth/events/track`
- Identity Service: `src/lib/growth/identity-service.ts`
- Event Service: `src/lib/growth/event-service.ts`

## Benefits

1. **User Attribution**: All events are linked to authenticated users
2. **Cross-Device Tracking**: Device and session IDs enable cross-device attribution
3. **Trait Tracking**: User properties enable segmentation and personalization
4. **Identity Resolution**: Unified identity across platforms (app, PostHog, Stripe, Meta)

## Related Features

- **TRACK-001**: Tracking SDK Integration (analytics foundation)
- **GDP-002**: Person & Identity Tables (canonical identity)
- **GDP-009**: PostHog Identity Stitching (cross-platform identity)
