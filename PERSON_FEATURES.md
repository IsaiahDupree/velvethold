# Person Features Computation (GDP-011)

## Overview

The Person Features system computes behavioral features from user events for segmentation and personalization. Features are computed from the unified `event` and `email_event` tables and stored in the `person_features` table.

## Features Tracked

### Active Days
- **Field**: `activeDays`
- **Description**: Number of unique calendar days with any activity
- **Source**: `event` table, distinct dates from `timestamp`
- **Use Case**: Identify engaged vs. dormant users

### Core Actions
- **Field**: `coreActions`
- **Description**: Count of high-value product actions
- **Events Counted**:
  - `profile_created`
  - `profile_completed`
  - `date_request_created`
  - `date_request_approved`
  - `date_confirmed`
  - `payment_completed`
  - `message_sent`
  - `verification_completed`
  - `signup_completed`
- **Use Case**: Measure product engagement and value realization

### Pricing Views
- **Field**: `pricingViews`
- **Description**: Number of times user viewed pricing information
- **Events Counted**:
  - `pricing_view`
  - `pricing_page_view`
- **Use Case**: Identify users interested in paid features, optimize pricing page

### Email Opens
- **Field**: `emailOpens`
- **Description**: Count of email open events
- **Source**: `email_event` table with `eventType = 'opened'`
- **Use Case**: Measure email engagement, segment by responsiveness

### Email Clicks
- **Field**: `emailClicks`
- **Description**: Count of email link click events
- **Source**: `email_event` table with `eventType = 'clicked'`
- **Use Case**: Measure email engagement quality

### Last Active
- **Field**: `lastActiveAt`
- **Description**: Timestamp of most recent activity
- **Source**: `event` table, max `timestamp`
- **Use Case**: Identify dormant users, trigger re-engagement campaigns

## Architecture

### Real-Time Updates

Features are updated incrementally when events are tracked:

1. Event is ingested via `/api/growth/events/track`
2. Event service calls `incrementalUpdateFeatures()`
3. Features are updated based on event type:
   - Core actions: increment if event matches core action list
   - Pricing views: increment if event matches pricing event
   - Active days: recomputed (lightweight query)
   - Last active: updated to event timestamp

### Batch Computation

Full recomputation is available via API for:
- Initial backfill of existing users
- Periodic reconciliation
- Recovery from errors

```bash
# Compute for single person
POST /api/growth/features/compute
{ "personId": "uuid" }

# Batch compute for multiple people
POST /api/growth/features/compute
{ "personIds": ["uuid1", "uuid2"] }

# Compute for recent activity
POST /api/growth/features/compute
{ "recentActivity": true, "daysBack": 7 }
```

### Email Event Integration

Email opens and clicks are tracked via Resend webhooks:

1. Resend sends webhook to `/api/webhooks/resend`
2. Webhook handler stores event in `email_event` table
3. Handler calls `incrementPersonFeature()` to update counters
4. Features are immediately available for segmentation

## Database Schema

```sql
CREATE TABLE person_features (
  id UUID PRIMARY KEY,
  person_id UUID NOT NULL UNIQUE REFERENCES person(id),
  active_days INTEGER NOT NULL DEFAULT 0,
  core_actions INTEGER NOT NULL DEFAULT 0,
  pricing_views INTEGER NOT NULL DEFAULT 0,
  email_opens INTEGER NOT NULL DEFAULT 0,
  email_clicks INTEGER NOT NULL DEFAULT 0,
  last_active_at TIMESTAMP,
  first_seen_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

## Usage Examples

### Computing Features

```typescript
import { computePersonFeatures } from "@/lib/growth/features-service";

// Compute all features for a person
await computePersonFeatures(personId);
```

### Querying Features

```typescript
import { getPersonFeatures } from "@/db/queries/growth-data-plane";

const features = await getPersonFeatures(personId);
console.log(`Active days: ${features.activeDays}`);
console.log(`Core actions: ${features.coreActions}`);
```

### Segmentation Example

```sql
-- Find highly engaged users (for upgrade campaigns)
SELECT p.*, pf.*
FROM person p
JOIN person_features pf ON p.id = pf.person_id
WHERE pf.active_days >= 7
  AND pf.core_actions >= 5
  AND pf.pricing_views >= 2;

-- Find dormant users (for re-engagement)
SELECT p.*, pf.*
FROM person p
JOIN person_features pf ON p.id = pf.person_id
WHERE pf.last_active_at < NOW() - INTERVAL '30 days'
  AND pf.core_actions >= 1;

-- Find email-engaged users (for email campaigns)
SELECT p.*, pf.*
FROM person p
JOIN person_features pf ON p.id = pf.person_id
WHERE pf.email_opens >= 3
  AND pf.email_clicks >= 1;
```

## Performance Considerations

1. **Incremental Updates**: Most features are updated incrementally in real-time, avoiding expensive full recomputation
2. **Batch Optimization**: Full recomputation uses parallel queries for efficiency
3. **Indexes**: `person_features.person_id` has unique index for fast lookups
4. **Error Handling**: Feature updates never fail event ingestion (non-blocking)

## Next Steps (GDP-012)

The Segment Engine will use these features to:
1. Evaluate segment membership based on feature criteria
2. Trigger automations (email campaigns, Meta audiences, outbound sales)
3. Update segment membership in real-time as features change

## Testing

See `scripts/test-person-features.ts` for manual testing:

```bash
npx tsx scripts/test-person-features.ts
```

## API Reference

### POST /api/growth/features/compute

Trigger feature computation.

**Request Bodies**:
- `{ personId: "uuid" }` - Single person
- `{ personIds: ["uuid1", "uuid2"] }` - Batch
- `{ recentActivity: true, daysBack: 7 }` - Recent activity

**Response**:
```json
{
  "success": true,
  "message": "Features computed for person {id}"
}
```

### GET /api/growth/features/compute

Get API documentation and feature descriptions.
