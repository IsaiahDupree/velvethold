# Segment Engine Documentation

The Segment Engine enables dynamic user segmentation based on behavioral features, subscription data, and events. It automatically triggers marketing automations when users enter or exit segments.

## Features

- **Feature-based Segmentation**: Target users by activity levels, core actions, pricing views, email engagement
- **Subscription-based Segmentation**: Filter by plan type, MRR, subscription status
- **Event-based Segmentation**: Target users by specific events within time windows
- **Automation Triggers**: Integrate with Resend, Meta Custom Audiences, and webhooks
- **Real-time Evaluation**: Segments are evaluated automatically after every event
- **Membership Tracking**: Track when users enter/exit segments for accurate automation triggering

## Segment Criteria Structure

### Feature Criteria
```typescript
{
  features: {
    activeDays: { min: 5, max: 30 },        // Active days between 5-30
    coreActions: { min: 3 },                // At least 3 core actions
    pricingViews: { eq: 2 },                // Exactly 2 pricing views
    emailOpens: { min: 5 },                 // At least 5 email opens
    emailClicks: { min: 1 }                 // At least 1 email click
  }
}
```

### Subscription Criteria
```typescript
{
  subscription: {
    status: ["active", "trialing"],         // Active or trialing subscriptions
    planName: ["premium", "pro"],           // Specific plan names
    mrrMin: 2900,                           // At least $29/month
    mrrMax: 9900                            // Up to $99/month
  }
}
```

### Event Criteria
```typescript
{
  events: [
    {
      eventName: "profile_completed",
      count: { min: 1 },                    // At least 1 occurrence
      within: 7                             // Within last 7 days
    }
  ]
}
```

### Person Criteria
```typescript
{
  person: {
    hasEmail: true,                         // Must have email
    hasPhone: false                         // Must not have phone
  }
}
```

## Automation Configuration

### Resend Integration
```typescript
{
  resend: {
    audienceId: "aud_123456",              // Resend audience ID
    trigger: "on_enter"                     // or "on_exit"
  }
}
```

### Meta Custom Audiences
```typescript
{
  meta: {
    customAudienceId: "123456789",         // Meta audience ID
    action: "add"                          // or "remove"
  }
}
```

### Webhook Integration
```typescript
{
  webhook: {
    url: "https://api.example.com/webhook",
    method: "POST",
    headers: {
      "X-API-Key": "secret-key"
    }
  }
}
```

## API Endpoints

### Create Segment
```bash
POST /api/growth/segments
Content-Type: application/json

{
  "name": "Active Power Users",
  "description": "Users with high engagement",
  "criteria": {
    "features": {
      "activeDays": { "min": 10 },
      "coreActions": { "min": 5 }
    }
  },
  "automationConfig": {
    "resend": {
      "audienceId": "aud_active_users",
      "trigger": "on_enter"
    }
  }
}
```

### List Segments
```bash
GET /api/growth/segments
```

### Get Segment Details
```bash
GET /api/growth/segments/[id]
```

### Update Segment
```bash
PATCH /api/growth/segments/[id]
Content-Type: application/json

{
  "criteria": {
    "features": {
      "activeDays": { "min": 15 }
    }
  }
}
```

### Get Segment Statistics
```bash
GET /api/growth/segments/[id]/stats

Response:
{
  "stats": {
    "segmentId": "segment_id",
    "memberCount": 42
  }
}
```

### Evaluate Segments
```bash
# Evaluate for a specific person
POST /api/growth/segments/evaluate
Content-Type: application/json

{
  "personId": "person_id"
}

# Batch evaluate all people
POST /api/growth/segments/evaluate
Content-Type: application/json

{
  "batchAll": true
}
```

## Usage Examples

### Example 1: Trial Users Who Viewed Pricing
Target users who are on trial and have viewed pricing, send them a conversion email.

```typescript
const segment = await createSegment({
  name: "Trial Users Viewing Pricing",
  description: "Trial subscribers checking pricing options",
  criteria: {
    subscription: {
      status: ["trialing"]
    },
    features: {
      pricingViews: { min: 1 }
    }
  },
  automationConfig: {
    resend: {
      audienceId: "aud_trial_converters",
      trigger: "on_enter"
    }
  }
});
```

### Example 2: Churned Users
Target users who canceled their subscription and haven't been active recently.

```typescript
const segment = await createSegment({
  name: "Churned Users",
  description: "Canceled subscribers for win-back campaigns",
  criteria: {
    subscription: {
      status: ["canceled"]
    },
    features: {
      activeDays: { max: 2 }  // Less than 2 active days
    }
  },
  automationConfig: {
    meta: {
      customAudienceId: "123456789",
      action: "add"
    },
    webhook: {
      url: "https://crm.example.com/winback",
      method: "POST"
    }
  }
});
```

### Example 3: Highly Engaged Users
Target power users for upsell opportunities.

```typescript
const segment = await createSegment({
  name: "Power Users",
  description: "Highly engaged users ready for upsell",
  criteria: {
    features: {
      activeDays: { min: 20 },
      coreActions: { min: 15 },
      emailOpens: { min: 5 }
    }
  },
  automationConfig: {
    resend: {
      audienceId: "aud_power_users",
      trigger: "on_enter"
    }
  }
});
```

## Automatic Evaluation

Segments are automatically evaluated after every event ingestion. The system:

1. Ingests event and updates person features
2. Evaluates all active segments for the person
3. Detects segment entry/exit
4. Triggers configured automations
5. Updates segment membership tracking

## Environment Variables

Required for automation integrations:

```bash
# Resend
RESEND_API_KEY=re_xxx

# Meta
META_ACCESS_TOKEN=xxx
META_PIXEL_ID=xxx
```

## Testing

Run the test script to see the segment engine in action:

```bash
npx tsx scripts/test-segment-engine.ts
```

## Architecture

### Core Components

1. **Segment Engine** (`src/lib/growth/segment-engine.ts`)
   - Evaluates segment membership criteria
   - Manages segment entry/exit detection
   - Triggers automations

2. **Segment Membership Tracking** (Database)
   - `segment`: Segment definitions
   - `segment_membership`: Active memberships with entry/exit timestamps

3. **API Routes** (`src/app/api/growth/segments/`)
   - CRUD operations for segments
   - Segment evaluation endpoints
   - Statistics endpoints

4. **Event Integration**
   - Automatic evaluation after event ingestion
   - Incremental feature updates trigger re-evaluation

### Data Flow

```
Event → Event Service → Feature Update → Segment Evaluation → Automation Trigger
                                              ↓
                                    Membership Tracking
```

## Performance Considerations

- Segment evaluation runs after each event (async, non-blocking)
- Failed automations are logged but don't fail event ingestion
- For large user bases, consider batch evaluation via cron jobs
- Use specific criteria to avoid evaluating all segments unnecessarily

## Future Enhancements

- [ ] Scheduled segment evaluations (cron jobs)
- [ ] Segment membership caching
- [ ] A/B testing support
- [ ] Segment overlap analysis
- [ ] Visual segment builder UI
- [ ] Export segment members
