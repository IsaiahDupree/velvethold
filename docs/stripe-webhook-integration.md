# Stripe Webhook Integration (GDP-007)

## Overview

The Stripe webhook integration handles subscription lifecycle events and maps Stripe customer IDs to the canonical person ID in the Growth Data Plane. This enables unified tracking of subscription status, MRR (Monthly Recurring Revenue), and customer monetization events.

## Implementation

### Webhook Endpoint

**Location:** `src/app/api/webhooks/stripe/route.ts`

The webhook endpoint is extended to handle three new subscription events:
- `customer.subscription.created` - When a new subscription is created
- `customer.subscription.updated` - When a subscription is modified
- `customer.subscription.deleted` - When a subscription is canceled/deleted

### Event Handlers

#### 1. handleSubscriptionCreated

Processes new subscription creation:
1. Resolves or creates a canonical person from the Stripe customer
2. Links the Stripe customer ID to the person via the identity system
3. Calculates MRR based on subscription interval (yearly subscriptions are divided by 12)
4. Upserts subscription record in the database
5. Tracks `subscription_started` event in the unified events table

#### 2. handleSubscriptionUpdated

Processes subscription updates:
1. Resolves the person from the Stripe customer ID
2. Updates subscription record with new details
3. Recalculates MRR if pricing changed
4. Tracks status change events for `canceled` or `past_due` states

#### 3. handleSubscriptionDeleted

Processes subscription cancellation:
1. Resolves the person from the Stripe customer ID
2. Sets subscription status to `canceled`
3. Sets MRR to 0
4. Tracks `subscription_canceled` event

### Identity Mapping

The integration uses the identity service to map Stripe customer IDs to person IDs:

```typescript
async function getOrCreatePersonFromStripeCustomer(
  customerId: string
): Promise<string>
```

**Process:**
1. Check if customer ID is already linked to a person
2. If not found, fetch customer details from Stripe
3. Create or find person by email
4. Link Stripe customer ID to person via `identity_link` table

This ensures:
- No duplicate person records are created
- Existing users are properly linked to their Stripe data
- Cross-platform identity resolution works correctly

## Database Schema

### Subscription Table

The `subscription` table stores the current snapshot of each subscription:

```sql
CREATE TABLE subscription (
  id UUID PRIMARY KEY,
  person_id UUID REFERENCES person(id),
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) NOT NULL,
  status subscription_status NOT NULL,
  plan_name VARCHAR(255),
  plan_interval VARCHAR(50),
  mrr INTEGER, -- Monthly Recurring Revenue in cents
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Identity Link Table

The `identity_link` table maps Stripe customer IDs to person IDs:

```sql
CREATE TABLE identity_link (
  id UUID PRIMARY KEY,
  person_id UUID REFERENCES person(id),
  provider identity_provider NOT NULL, -- 'stripe'
  external_id VARCHAR(255) NOT NULL, -- Stripe customer ID
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## MRR Calculation

Monthly Recurring Revenue is calculated based on the subscription interval:

- **Monthly subscriptions:** MRR = unit_amount (in cents)
- **Yearly subscriptions:** MRR = unit_amount / 12 (converted to monthly)
- **Canceled subscriptions:** MRR = 0

Example:
- $99/month subscription → MRR = 9900 cents
- $999/year subscription → MRR = 8325 cents (999 / 12)

## Event Tracking

Subscription lifecycle events are tracked in the unified `event` table:

### subscription_started
Tracked when a new subscription is created.

**Properties:**
- `subscriptionId`: Stripe subscription ID
- `customerId`: Stripe customer ID
- `status`: Subscription status
- `planName`: Product/plan name
- `planInterval`: Billing interval (month/year)
- `mrr`: Monthly recurring revenue in cents

### subscription_canceled
Tracked when a subscription is deleted.

**Properties:**
- `subscriptionId`: Stripe subscription ID
- `customerId`: Stripe customer ID
- `planName`: Product/plan name
- `canceledAt`: Cancellation timestamp

### subscription_past_due / subscription_canceled (from update)
Tracked when subscription status changes to `past_due` or `canceled`.

## Configuration

### Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Stripe Dashboard Setup

1. Go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Enter URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret to `.env.local`

## Testing

### Manual Testing

Use the Stripe CLI to send test webhooks:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local development
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

### Test Queries

Check subscription records:
```sql
SELECT * FROM subscription WHERE stripe_customer_id = 'cus_xxx';
```

Check identity links:
```sql
SELECT * FROM identity_link WHERE provider = 'stripe';
```

Check tracked events:
```sql
SELECT * FROM event
WHERE event_name IN ('subscription_started', 'subscription_canceled')
ORDER BY timestamp DESC;
```

## Error Handling

The webhook handler includes comprehensive error handling:

1. **Signature Verification:** Validates webhook signature before processing
2. **Customer Not Found:** Throws error if Stripe customer is deleted
3. **Database Errors:** Logged and returned as 500 status
4. **Identity Resolution:** Creates new person if customer not found

All errors are logged with context for debugging:
```
Error handling subscription created: [error details]
```

## Integration with Growth Data Plane

The Stripe webhook integration is part of the Growth Data Plane system (GDP-007 and GDP-008):

- **GDP-007:** Handle subscription events and map customer IDs to person IDs ✓
- **GDP-008:** Maintain subscription snapshot with MRR calculation ✓

This enables downstream features:
- **GDP-011:** Person features computation (including subscription status)
- **GDP-012:** Segment engine (e.g., "active_subscribers", "churned_users")

## Next Steps

1. **GDP-009:** Implement PostHog identity stitching to sync person IDs
2. **GDP-010:** Add Meta Pixel + CAPI for advertising attribution
3. **GDP-011:** Compute person features including subscription metrics
4. **GDP-012:** Build segment engine to trigger automations based on subscription status
