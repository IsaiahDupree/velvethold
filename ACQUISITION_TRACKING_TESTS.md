# TRACK-002: Acquisition Event Tracking - Test Plan

## Feature Overview
Track landing_view, cta_click, pricing_view with UTM params

## Test Cases

### 1. Landing View Tracking
**Test**: Visit the landing page
**Expected Events**:
- `landing_view` event tracked on page load
- Properties include: `page: "home"`
- UTM params captured if present in URL

**Test with UTM params**:
```
Visit: http://localhost:3000/?utm_source=facebook&utm_medium=cpc&utm_campaign=launch
```
Expected: landing_view event with utm params in properties

### 2. CTA Click Tracking
**Test**: Click each CTA button on landing page
**Expected Events**:

| Button Location | CTA Name | Event Properties |
|----------------|----------|------------------|
| Nav Sign In | nav_signin | cta_name: "nav_signin", destination: "/auth/signin", page: "home" |
| Nav Get Started | nav_get_started | cta_name: "nav_get_started", destination: "/auth/signup", page: "home" |
| Hero Create Profile | hero_create_profile | cta_name: "hero_create_profile", destination: "/auth/signup", page: "home" |
| Hero How It Works | hero_how_it_works | cta_name: "hero_how_it_works", destination: "#how-it-works", page: "home" |
| Footer CTA | footer_cta_create_profile | cta_name: "footer_cta_create_profile", destination: "/auth/signup", page: "home" |
| Footer Pricing Link | footer_pricing | cta_name: "footer_pricing", destination: "/pricing", page: "home" |

### 3. Pricing View Tracking
**Test**: Navigate to /pricing page
**Expected Events**:
- `pricing_view` event tracked on page load
- Properties include: `page: "pricing"`
- UTM params captured if present in URL

**Test with UTM params**:
```
Visit: http://localhost:3000/pricing?utm_source=google&utm_medium=cpc
```
Expected: pricing_view event with utm params in properties

### 4. Pricing Page CTA Tracking
**Test**: Click CTAs on pricing page
**Expected Events**:

| Button Location | CTA Name | Event Properties |
|----------------|----------|------------------|
| Nav Get Started | nav_get_started | cta_name: "nav_get_started", destination: "/auth/signup", page: "pricing" |
| Invitee Signup | pricing_invitee_signup | cta_name: "pricing_invitee_signup", destination: "/auth/signup", page: "pricing" |
| Requester Signup | pricing_requester_signup | cta_name: "pricing_requester_signup", destination: "/auth/signup", page: "pricing" |
| Bottom CTA | pricing_bottom_cta | cta_name: "pricing_bottom_cta", destination: "/auth/signup", page: "pricing" |

## Testing Method

### Manual Browser Testing
1. Open browser DevTools → Network tab
2. Visit pages and click buttons
3. Monitor POST requests to `/api/growth/events/track`
4. Verify event payload matches expected structure

### Database Verification
Check events table in database:
```sql
SELECT * FROM event
WHERE event_name IN ('landing_view', 'cta_click', 'pricing_view')
ORDER BY timestamp DESC
LIMIT 20;
```

### Expected Event Schema
```json
{
  "source": "web",
  "eventName": "landing_view" | "cta_click" | "pricing_view",
  "properties": {
    "page": "home" | "pricing",
    "cta_name": "...",  // for cta_click only
    "destination": "...",  // for cta_click only
    "utm": {  // if UTM params present
      "source": "...",
      "medium": "...",
      "campaign": "...",
      "term": "...",
      "content": "..."
    }
  },
  "sessionId": "...",
  "deviceId": "..."
}
```

## Implementation Status

### ✅ Completed
- [x] Added `landing_view` tracking to landing page (/)
- [x] Added `cta_click` tracking to all CTAs on landing page
- [x] Created pricing page (/pricing)
- [x] Added `pricing_view` tracking to pricing page
- [x] Added `cta_click` tracking to all CTAs on pricing page
- [x] UTM parameter capture already implemented in analytics.ts
- [x] Session and device ID tracking already implemented
- [x] API endpoint ready at /api/growth/events/track
- [x] Build succeeds with no errors

### Test Results
- Application builds successfully
- Pages render correctly
- All tracking events properly configured
- UTM params automatically captured and included in events

## Notes
- All tracking is done client-side via `track()` function from `@/lib/growth/analytics`
- Events are sent asynchronously and failures don't break UX
- Session management automatically handled (30-minute timeout)
- Device ID persisted in localStorage for cross-session tracking
- UTM params stored in sessionStorage for attribution throughout session
