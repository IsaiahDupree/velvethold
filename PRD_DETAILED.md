# VelvetHold - Detailed Product Requirements

## Executive Summary

**Product:** VelvetHold - Premium date reservation platform with deposit-based commitment  
**Market:** $5.6B dating app market, 300M+ users globally, 40-60% no-show rate  
**Solution:** Refundable deposits ensure serious intentions and eliminate no-shows  
**Business Model:** Transaction fees (2.9% + $0.30), future premium features

---

## Detailed User Personas

### Sarah - The Selective Professional (Invitee)
- **Age:** 28, NYC, Marketing Manager, $85K/year
- **Pain Points:** 3 no-shows last month, low-effort matches, safety concerns
- **VelvetHold Usage:** $40 deposit, 35% approval rate, weekday evenings
- **Quote:** *"If they can't commit $40, they won't commit to showing up."*

### Marcus - The Intentional Dater (Requester)
- **Age:** 32, SF, Software Engineer, $150K/year
- **Pain Points:** Matches ghost, hard to stand out, unclear if serious
- **VelvetHold Usage:** $35 avg deposit, 2-3 requests/week, 40% approval rate
- **Quote:** *"I'm happy to put money down. It shows I'm serious."*

---

## Complete Feature Specifications

### 1. Registration & Authentication

**Sign-Up Requirements:**
- Email validation with 6-digit code (15-min expiry)
- Password: Min 8 chars, 1 uppercase, 1 number, 1 special char
- Age confirmation (18+), Terms acceptance
- Rate limiting: 5 attempts/hour per IP
- CAPTCHA after 2 failed attempts

**Session Management:**
- JWT tokens (RS256 signed)
- 30-day session (remember me) or 24-hour default
- Refresh token rotation
- Max 3 concurrent devices
- Auto-revoke on password change

**Two-Factor Authentication:**
- SMS OTP or authenticator app (TOTP)
- 10 backup codes generated
- Required for accounts with $500+ deposits

---

### 2. Invitee Profile - Detailed Specifications

#### Basic Information
- **Display Name:** 2-50 chars, no special chars except hyphen/apostrophe
- **Age:** 18-99, must match ID verification
- **Location:** City-level only (Google Places API), "Within 10 miles of [City]"
- **Photos:** Min 2, max 6, 10MB each, 800x800px minimum, face detection required
- **Bio:** 100-500 chars, profanity filter, no contact info

#### Date Preferences
- **Intent:** Dating / Relationship / Friends (single select)
- **Date Types:** Coffee, Dinner, Activity, Museum, Drinks, Walk, Brunch, Gaming (multi-select)
- **Boundaries:** 0-300 chars, examples: "Public places only", "No late-night meetups"

#### Screening Questions
- **Count:** 3-5 questions required
- **Length:** 200 chars per question
- **Templates Provided:**
  1. "What's your idea of a perfect first date?"
  2. "What are you looking for in a connection?"
  3. "Why would you like to meet me specifically?"
- **Answer Requirements:** 50-500 chars, profanity filter

#### Deposit & Policy
- **Amount:** $10-$200 (recommended $25-$50)
- **Purpose Statement:** 100-200 chars, must state "refundable"
- **Cancellation Policy Templates:**
  - **Flexible:** "Full refund 24+ hours before, 50% within 24 hours, no refund for no-shows"
  - **Moderate:** "Full refund 48+ hours before, no refund within 48 hours"
  - **Strict:** "Full refund 72+ hours before, 50% 48-72 hours, no refund within 48 hours"

#### Availability Settings
- **Visibility:** Public / Verified Users / Paid Requesters / Approved Only
- **Windows:** Day + time range (e.g., "Mon-Thu: 6-9 PM")
- **Fuzzing:** Exact times / Time blocks / "Available this week"
- **Buffer Zones:** 15-60 min before/after slots
- **Request Limits:** 1-20 per week (optional)

---

### 3. Requester Profile - Detailed Specifications

**Same as Invitee:** Display name, age, location, photos (min 2), bio (min 50 chars)

**Additional Fields:**
- **Employment:** Optional, "Job Title at Company", no URLs
- **Education:** Optional, "Degree, Institution", no URLs
- **Why Optional:** Avoid discrimination, user choice

**Verification Required:**
- Identity verification (Persona/Onfido)
- Payment method (Stripe)
- Profile review (automated + manual if flagged)

---

### 4. Date Request Flow - Step by Step

#### Step 1: Browse & Filter
- **Filters:** Location (5-100 miles), Age (18-99), Deposit ($10-$200), Intent, Date Types, Availability
- **Sorting:** Recommended (algorithm), Newest, Deposit (low/high), Distance
- **Display:** Grid (2-3 columns) or List view

#### Step 2: View Profile
- Photo carousel, bio, screening questions, deposit amount, cancellation policy
- "Send Request" CTA button

#### Step 3: Answer Screening Questions
- One question per screen (mobile) or all on one page (desktop)
- 50-500 chars per answer
- Auto-save every 30 seconds
- Tips: "Be specific", "Reference their profile", "Show genuine interest"

#### Step 4: Write Introduction
- 100-500 chars required
- Profanity filter, no contact info
- Template suggestions provided

#### Step 5: Select Preferences
- Date type (from invitee's preferences)
- Preferred time (if availability shown) or "Flexible"
- Proposed location (general area, optional)

#### Step 6: Review & Pay
- **Breakdown:**
  - Deposit: $XX.XX
  - Processing fee: $X.XX (Stripe 2.9% + $0.30)
  - Total: $XX.XX
- Cancellation policy displayed
- Checkbox: "I understand this is refundable per policy"
- **Payment:** Stripe Checkout, supports cards/Apple Pay/Google Pay
- **Confirmation:** Email sent, request ID provided

---

### 5. Request Management - Invitee

#### Inbox Layout
- **Tabs:** Pending, Approved, Declined, Expired
- **Sort:** Newest, Oldest, Deposit amount
- **Card Display:** Photo, name, age, deposit, intro preview, expiration timer

#### Request Detail View
- Requester profile summary with photos
- All screening answers (with character count)
- Introduction message
- Date preferences (type, time, location)
- Deposit info and cancellation policy

#### Approval Actions
- **Approve:** Confirmation dialog → Chat unlocks → Deposit held → Email notifications
- **Decline:** Optional reason → Deposit refunded immediately → Requester notified
- **Report:** Opens report form with evidence upload
- **Block:** Blocks user + auto-declines request

---

### 6. Chat System - Detailed Specs

#### Interface
- **Left Sidebar:** Chat list, sorted by recent, unread badges
- **Main Area:** Conversation with message history
- **Right Panel:** Match details (collapsible)

#### Message Features
- Timestamp grouping (Today, Yesterday, etc.)
- Read receipts (optional user setting)
- Typing indicators
- Status: Sending → Sent → Delivered → Read
- Character limit: 2000 chars

#### Safety Features
- No external links (first 3 messages)
- No phone/email (first 3 messages)
- Profanity filter
- Report button always visible
- Auto-archive after 30 days inactive

#### Date Confirmation
- **Trigger:** 24 hours after scheduled date
- **Options:** Yes we met / No-show / Rescheduled / Dispute
- **If Both Confirm:** Deposit refunded, optional rating
- **If No-Show:** 48-hour dispute window, manual review if contested

---

### 7. Payment Processing - Technical Details

#### Stripe Integration

**Payment Intent Creation:**
```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: depositAmount + processingFee,
  currency: 'usd',
  payment_method_types: ['card', 'apple_pay', 'google_pay'],
  capture_method: 'manual', // Hold funds in escrow
  metadata: {
    request_id: requestId,
    invitee_id: inviteeId,
    requester_id: requesterId
  }
});
```

**Webhook Events:**
- `payment_intent.succeeded` → Update request status
- `payment_intent.canceled` → Handle decline
- `charge.refunded` → Update transaction record

**Refund Logic:**
- Declined request: 100% immediate refund
- Date confirmed: 100% refund per policy
- No-show by invitee: 100% refund to requester
- No-show by requester: Per invitee's policy
- Disputed: Manual review (3-5 business days)

---

### 8. Verification System

#### Identity Verification (Persona)

**Process:**
1. Selfie capture (liveness detection)
2. ID upload (driver's license, passport, national ID)
3. Automated matching (face to ID, age check, document authenticity)
4. Turnaround: <5 minutes (90%), <24 hours manual review (10%)

**Re-Verification Triggers:**
- Every 12 months
- Significant profile photo change
- Suspicious activity detected

**Verification Badge:**
- Blue checkmark on profile
- Required to send/receive requests

---

### 9. Safety & Moderation

#### Report System
- **Types:** Inappropriate messages, fake profile, harassment, scam, no-show, safety concern
- **Process:** User reports → Automated triage → Review (1-48 hours based on severity)
- **Actions:** Warning, suspension (7-30 days), permanent ban, law enforcement referral

#### Content Moderation
- **Automated:** Profanity filter, contact info detection, URL filtering, spam detection
- **Manual:** Flagged content reviewed by humans (24-hour turnaround)
- **Appeals:** Users can appeal decisions (48-hour review by senior moderator)

#### Block System
- Blocked user can't view profile, send requests, or message
- No notification sent to blocked user
- Unblock available anytime in settings

---

### 10. Technical Architecture

#### Stack
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Server Actions
- **Database:** PostgreSQL 15+ (Supabase/Vercel), Drizzle ORM
- **Payments:** Stripe (Payment Intents, Webhooks, Refunds)
- **Storage:** Vercel Blob or Supabase Storage
- **Verification:** Persona (primary), Onfido (backup)
- **Real-Time:** Pusher or Supabase Realtime
- **Email:** Resend or SendGrid
- **Hosting:** Vercel (multi-region, CDN, auto-SSL)

#### Security
- **Encryption:** AES-256 at rest, TLS 1.3 in transit
- **Authentication:** JWT (RS256), refresh token rotation
- **Passwords:** bcrypt (cost 12), breach detection (HaveIBeenPwned)
- **API:** Rate limiting, CORS whitelist, CSRF protection, input validation (Zod)
- **PCI-DSS:** Level 1 compliant via Stripe, no card data stored

---

### 11. Key Metrics & KPIs

#### Acquisition
- Sign-ups per week
- Invitee:Requester ratio (target 1:4)
- Verification completion (target >80%)
- Profile completion (target >85%)

#### Engagement
- DAU/MAU ratio (target >20%)
- Requests per active requester (target 2-3/week)
- Approval rate (target 30-40%)
- Time to approval (target <48 hours)
- Messages per chat (target >10)

#### Revenue
- Deposits processed per week
- Average deposit (target $35-45)
- Refund rate (target <60%)
- Chargeback rate (target <1%)

#### Success
- Date completion rate (target >70%)
- User satisfaction NPS (target >50)
- Repeat usage rate

#### Safety
- Reports per 1000 users (target <10)
- Resolution time (target <24 hours)
- Block rate (target <5%)

---

### 12. Compliance & Legal

#### GDPR
- Right to access (data export)
- Right to erasure (account deletion within 30 days)
- Right to rectification (profile editing)
- Data processing agreements with all vendors
- Privacy policy (clear, accessible)

#### CCPA
- Do Not Sell My Info (honored)
- Disclosure of data collected
- Deletion requests (45-day turnaround)

#### Terms of Service
- 18+ age requirement (strict enforcement)
- Prohibited conduct (harassment, fraud, impersonation)
- Deposit refund policies (clear, enforceable)
- Dispute resolution (arbitration clause)
- Limitation of liability

---

### 13. Go-to-Market Strategy

#### Phase 1: Private Beta (Weeks 1-4)
- Invite-only: 50 invitees, 200 requesters
- Cities: NYC, LA, SF
- Manual verification, direct feedback loops

#### Phase 2: Public Beta (Weeks 5-12)
- Open sign-ups with waitlist
- Automated verification
- Referral system (both sides get $10 credit)
- Content marketing (safety-focused)

#### Phase 3: Scale (Week 13+)
- Paid acquisition (if unit economics work)
- Expand to top 20 US cities
- Native apps (if web validates)
- Venue partnerships (commission on bookings)

---

### 14. Roadmap

**Q1 2026 (MVP):**
- ✅ Landing page & auth
- ✅ Profile creation (invitee & requester)
- ✅ Browse & discovery
- ✅ Request & approval flow
- ✅ Stripe integration
- ✅ Basic chat
- ✅ Identity verification

**Q2 2026 (Enhancement):**
- Advanced filters & search
- Video verification calls
- In-app date confirmation
- Rating system (private)
- Push notifications
- Email digest

**Q3 2026 (Growth):**
- Native iOS app
- Native Android app
- Referral program
- Premium features (priority placement)
- Background checks (optional)

**Q4 2026 (Scale):**
- International expansion
- AI-powered matching
- Venue partnerships
- Events & experiences
- Subscription tiers

---

## Success Criteria (MVP)

1. **Onboarding:** 80%+ complete profile setup
2. **Request Flow:** <5 min to send first request
3. **Approval Rate:** >30%
4. **Date Completion:** >70% of approved requests result in dates
5. **Safety:** <1% report rate
6. **Payments:** <2% chargeback rate
7. **Retention:** >40% Day 7 retention

---

## Open Questions & Decisions Needed

1. Should we allow video verification calls pre-date?
2. What happens if both parties no-show?
3. Should deposits be tiered by date type (coffee vs dinner)?
4. How do we handle timezone differences?
5. Should we have a "date happened" confirmation from both sides?
6. What's the dispute resolution process timeline?
7. Should we implement a rating system (and if so, public or private)?
8. How do we handle users who are both invitee and requester?

---

## Appendix: User Flow Diagrams

### Invitee Journey
```
Sign Up → Verify Email → Create Profile (5 steps) → 
ID Verification → Profile Live → Receive Requests → 
Review & Approve → Chat → Plan Date → Meet → 
Confirm Date → Deposit Refunded
```

### Requester Journey
```
Sign Up → Verify Email → Create Profile (3 steps) → 
ID Verification → Add Payment → Browse Profiles → 
Send Request (answer questions + pay) → Wait for Approval → 
Chat → Plan Date → Meet → Confirm Date → Deposit Refunded
```

### Request Lifecycle
```
Created (payment pending) → Payment Succeeded → 
Pending Approval → Approved/Declined → 
[If Approved] Chat Active → Date Scheduled → 
Date Confirmed → Deposit Refunded → Completed
```

---

**Document Version:** 2.0  
**Last Updated:** January 20, 2026  
**Owner:** Product Team  
**Status:** Living Document
