# Identity System (GDP-002)

## Overview

The Identity System provides unified identity tracking across multiple platforms and services:
- **App**: VelvetHold application users
- **PostHog**: Analytics and product tracking
- **Stripe**: Payment and subscription data
- **Meta**: Facebook/Instagram advertising

## Architecture

### Person Table
The `person` table is the canonical source of truth for user identity. It stores:
- `id`: Unique person identifier
- `email`: Primary matching key
- `phone`: Secondary matching key
- `name`: Person's name
- `traits`: Flexible JSONB field for additional attributes

### Identity Link Table
The `identity_link` table maps external system IDs to the canonical person:
- `personId`: References the person table
- `provider`: Which system (posthog, stripe, meta, app)
- `externalId`: ID from the external system
- `metadata`: Provider-specific data

## Usage

### Automatic Syncing
Users are automatically synced to the person table on:
- **Signup**: When a new user creates an account
- **Login**: When a user signs in

### Manual Syncing
To manually sync a user:
```typescript
import { identifyUser } from "@/lib/growth/identity-service";

// Basic sync
await identifyUser(userId);

// Sync with additional traits
await identifyUser(userId, {
  plan: "premium",
  signupSource: "landing-page",
});
```

### Identity Resolution
Get person ID from external systems:
```typescript
import { resolvePersonFromExternalId } from "@/lib/growth/identity-service";

// Get person from Stripe customer ID
const personId = await resolvePersonFromExternalId("stripe", stripeCustomerId);

// Get person from PostHog distinct ID
const personId = await resolvePersonFromExternalId("posthog", posthogId);
```

### Linking External Identities
Link an external identity to a person:
```typescript
import { linkIdentity } from "@/lib/growth/identity-service";

await linkIdentity(personId, {
  provider: "stripe",
  externalId: "cus_123456",
  metadata: {
    customerId: "cus_123456",
    accountCreated: new Date().toISOString(),
  },
});
```

### Getting All Identities
Retrieve all linked identities for a person:
```typescript
import { getPersonIdentities } from "@/lib/growth/identity-service";

const identities = await getPersonIdentities(personId);
// Returns:
// {
//   personId: "...",
//   identities: {
//     app: { externalId: "...", metadata: {...}, linkedAt: "..." },
//     stripe: { externalId: "...", metadata: {...}, linkedAt: "..." },
//     posthog: { externalId: "...", metadata: {...}, linkedAt: "..." },
//   }
// }
```

## API Endpoints

### POST /api/growth/identity/sync
Sync the current authenticated user to the person table.

**Request:**
```json
{
  "traits": {
    "plan": "premium",
    "signupSource": "landing-page"
  }
}
```

**Response:**
```json
{
  "success": true,
  "personId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Backfilling Existing Users

To sync all existing users to the person table:

```bash
npx tsx scripts/backfill-persons.ts
```

This script:
1. Fetches all users from the app database
2. Creates or updates person records
3. Links app user IDs to person records
4. Reports success/error counts

## Identity Stitching

The system automatically handles identity stitching:
1. **Email Matching**: Primary key for finding existing persons
2. **External ID Lookup**: Prevents duplicate links
3. **Trait Merging**: New traits are merged with existing ones

## Next Steps

Once identity is established, you can:
1. Track events linked to persons (GDP-003)
2. Build segments based on person features (GDP-011, GDP-012)
3. Trigger automations for specific person segments
4. Sync person data to PostHog for unified analytics (GDP-009)
5. Send person data to Meta for custom audiences (GDP-010)
