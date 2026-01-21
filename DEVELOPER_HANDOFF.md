# VelvetHold - Developer Handoff Guide

**Version:** 1.0  
**Date:** January 20, 2026  
**Status:** Ready for External Development Team

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Current State](#current-state)
3. [Getting Started](#getting-started)
4. [Architecture & Stack](#architecture--stack)
5. [Codebase Structure](#codebase-structure)
6. [Development Workflow](#development-workflow)
7. [Priority Tasks](#priority-tasks)
8. [API Integration Guide](#api-integration-guide)
9. [Database Management](#database-management)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Guide](#deployment-guide)
12. [Security Checklist](#security-checklist)
13. [Performance Targets](#performance-targets)
14. [Support & Resources](#support--resources)

---

## 1. Project Overview

### What is VelvetHold?

VelvetHold is a premium dating platform that uses refundable deposits to ensure serious intentions and eliminate no-shows. Think of it as "dating with accountability."

**Core Value Proposition:**
- Invitees set deposit amounts ($10-$200) for date requests
- Requesters pay deposits to prove serious intentions
- Deposits are fully refundable per clear cancellation policies
- Both parties must confirm the date happened for deposit refund

**Target Market:**
- Primary: Women 25-40 in major US cities (invitees)
- Secondary: Men 25-45 seeking serious relationships (requesters)
- Initial launch: NYC, LA, SF

**Business Model:**
- Transaction fees on deposits (Stripe: 2.9% + $0.30)
- Future: Premium features, subscriptions, venue partnerships

### Why This Matters

- **Market Size:** $5.6B dating app market, 300M+ users globally
- **Problem:** 40-60% no-show rate on dating apps
- **Differentiation:** Only platform using deposits for accountability
- **Compliance:** Web-first to avoid app store rejection (framed as "reservation hold")

---

## 2. Current State

### ✅ What's Built (Ready to Use)

**Infrastructure:**
- ✅ Next.js 15 project with TypeScript
- ✅ Tailwind CSS v4 with VelvetHold brand colors
- ✅ shadcn/ui components configured
- ✅ Drizzle ORM with PostgreSQL schema
- ✅ Project structure and dependencies

**Pages Completed:**
- ✅ Landing page (`/`) - Full marketing site with hero, features, safety, footer
- ✅ Sign up page (`/auth/signup`) - Email/password registration
- ✅ Sign in page (`/auth/signin`) - Authentication
- ✅ Onboarding role selection (`/onboarding`) - Invitee vs Requester choice
- ✅ Invitee profile setup (`/onboarding/invitee`) - 5-step wizard
- ✅ Requester profile setup (`/onboarding/requester`) - 3-step wizard

**Database Schema:**
- ✅ Complete PostgreSQL schema (11 tables)
- ✅ Users, profiles, availability, requests, payments, chats, messages
- ✅ All relations and enums defined
- ✅ Migration-ready with Drizzle

**Design System:**
- ✅ VelvetHold color palette (Velvet Plum, Blush Rose, Gilded Gold)
- ✅ Light/dark theme support
- ✅ Responsive layouts
- ✅ Reusable UI components

### 🚧 What Needs to Be Built (Your Work)

**Critical Path (MVP):**
1. Authentication system (NextAuth.js or Clerk)
2. Database connection & migrations
3. Profile data persistence
4. Browse/discovery page
5. Date request flow with Stripe
6. Request approval system
7. Chat functionality
8. Identity verification (Persona/Onfido)
9. Deployment to production

**See [Priority Tasks](#priority-tasks) for detailed breakdown.**

---

## 3. Getting Started

### Prerequisites

**Required Software:**
- Node.js 20.x or higher
- npm or pnpm
- PostgreSQL 15+ (local or cloud)
- Git
- Code editor (VS Code recommended)

**Required Accounts:**
- Stripe account (test mode)
- Supabase or Vercel Postgres account
- Persona or Onfido account (identity verification)
- Vercel account (deployment)
- Resend or SendGrid account (email)

### Initial Setup (30 minutes)

**Step 1: Clone & Install**
```bash
cd /path/to/VelvetHold
npm install
```

**Step 2: Environment Variables**

Create `.env.local` file:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/velvethold

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Auth (generate with: openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Verification (Persona: https://withpersona.com)
PERSONA_API_KEY=persona_sandbox_...
PERSONA_TEMPLATE_ID=itmpl_...

# Email (Resend: https://resend.com)
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 3: Database Setup**
```bash
# Generate migration files
npx drizzle-kit generate

# Push schema to database
npx drizzle-kit push

# Verify tables created
npx drizzle-kit studio
```

**Step 4: Run Development Server**
```bash
npm run dev
```

Visit http://localhost:3000

**Step 5: Verify Setup**
- [ ] Landing page loads
- [ ] Sign up page loads
- [ ] Onboarding pages load
- [ ] No console errors
- [ ] Database connection works

---

## 4. Architecture & Stack

### Technology Stack

**Frontend:**
```
Next.js 15 (App Router)
├── React 19
├── TypeScript 5.x
├── Tailwind CSS v4
├── shadcn/ui + Radix UI
├── Lucide React (icons)
├── React Hook Form + Zod (forms)
└── SWR (data fetching)
```

**Backend:**
```
Next.js API Routes + Server Actions
├── TypeScript 5.x
├── Drizzle ORM
├── PostgreSQL 15+
├── Stripe SDK
├── Persona SDK
└── Resend/SendGrid
```

**Infrastructure:**
```
Vercel (hosting)
├── Supabase/Vercel Postgres (database)
├── Vercel Blob (file storage)
├── Vercel Edge Network (CDN)
└── Pusher/Supabase Realtime (chat)
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                     │
│  Next.js Pages + React Components + Tailwind CSS       │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS / WebSocket
                     │
┌────────────────────▼────────────────────────────────────┐
│              Next.js Server (Vercel)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ API Routes  │  │Server Actions│  │  Middleware   │ │
│  └─────────────┘  └──────────────┘  └───────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────┬─────────┐
        │            │            │              │         │
┌───────▼──┐  ┌──────▼─────┐  ┌──▼────────┐  ┌──▼──────┐ │
│PostgreSQL│  │   Stripe   │  │  Persona  │  │ Resend  │ │
│(Supabase)│  │  Payments  │  │    ID     │  │  Email  │ │
└──────────┘  └────────────┘  └───────────┘  └─────────┘ │
                                                           │
                                              ┌────────────▼──┐
                                              │ Vercel Blob   │
                                              │ File Storage  │
                                              └───────────────┘
```

### Key Design Decisions

**Why Next.js App Router?**
- Server Components reduce client bundle size
- Server Actions simplify data mutations
- Built-in API routes
- Excellent TypeScript support
- Vercel deployment optimization

**Why Drizzle ORM?**
- Type-safe queries
- Lightweight (no runtime overhead)
- SQL-like syntax (easy to learn)
- Excellent migration system
- Better performance than Prisma

**Why Stripe?**
- Industry standard for payments
- Excellent escrow/hold capabilities
- Built-in fraud detection (Radar)
- PCI-DSS Level 1 compliant
- Great developer experience

**Why Web-First?**
- Avoid app store rejection risk
- Faster iteration cycles
- Lower development costs
- SEO benefits
- Can always add native apps later

---

## 5. Codebase Structure

### Directory Layout

```
VelvetHold/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Auth route group
│   │   │   ├── signin/
│   │   │   └── signup/
│   │   ├── (dashboard)/         # Protected routes (TO BUILD)
│   │   │   ├── browse/
│   │   │   ├── requests/
│   │   │   ├── chats/
│   │   │   └── settings/
│   │   ├── onboarding/
│   │   │   ├── invitee/
│   │   │   └── requester/
│   │   ├── api/                 # API routes (TO BUILD)
│   │   │   ├── auth/
│   │   │   ├── profiles/
│   │   │   ├── requests/
│   │   │   ├── payments/
│   │   │   └── webhooks/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Landing page
│   │   └── globals.css          # Global styles
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── auth/                # Auth components (TO BUILD)
│   │   ├── profile/             # Profile components (TO BUILD)
│   │   ├── chat/                # Chat components (TO BUILD)
│   │   └── shared/              # Shared components (TO BUILD)
│   │
│   ├── lib/
│   │   ├── utils.ts             # Utility functions
│   │   ├── validations.ts       # Zod schemas (TO BUILD)
│   │   ├── stripe.ts            # Stripe client (TO BUILD)
│   │   ├── persona.ts           # Persona client (TO BUILD)
│   │   └── email.ts             # Email client (TO BUILD)
│   │
│   ├── db/
│   │   ├── schema.ts            # Database schema (COMPLETE)
│   │   ├── index.ts             # Database client
│   │   └── queries/             # Database queries (TO BUILD)
│   │       ├── users.ts
│   │       ├── profiles.ts
│   │       ├── requests.ts
│   │       └── ...
│   │
│   ├── hooks/                   # Custom React hooks (TO BUILD)
│   │   ├── useAuth.ts
│   │   ├── useProfile.ts
│   │   └── useChat.ts
│   │
│   └── types/                   # TypeScript types (TO BUILD)
│       ├── index.ts
│       ├── database.ts
│       └── api.ts
│
├── public/                      # Static assets
│   ├── images/
│   └── icons/
│
├── drizzle/                     # Migration files
│   └── (generated by drizzle-kit)
│
├── tests/                       # Tests (TO BUILD)
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.local                   # Environment variables (create this)
├── .env.example                 # Example env vars
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── drizzle.config.ts
├── prd.txt                      # Product requirements
├── PRD_DETAILED.md              # Detailed specifications
├── IMPLEMENTATION.md            # Implementation guide
└── DEVELOPER_HANDOFF.md         # This file
```

### File Naming Conventions

- **Components:** PascalCase (e.g., `ProfileCard.tsx`)
- **Utilities:** camelCase (e.g., `formatDate.ts`)
- **API Routes:** kebab-case (e.g., `create-request.ts`)
- **Pages:** kebab-case folders (e.g., `sign-in/page.tsx`)
- **Types:** PascalCase (e.g., `UserProfile.ts`)

### Import Aliases

```typescript
// Use @ for src imports
import { Button } from "@/components/ui/button"
import { db } from "@/db"
import { formatCurrency } from "@/lib/utils"
```

---

## 6. Development Workflow

### Branch Strategy

```
main (production)
  ├── develop (staging)
  │   ├── feature/auth-system
  │   ├── feature/profile-creation
  │   ├── feature/stripe-integration
  │   └── feature/chat-system
  └── hotfix/critical-bug
```

**Branch Naming:**
- Features: `feature/description`
- Bugs: `fix/description`
- Hotfixes: `hotfix/description`

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(auth): implement NextAuth.js with email provider

- Add NextAuth.js configuration
- Create sign-in/sign-up API routes
- Add session middleware

Closes #123
```

### Code Review Checklist

**Before Submitting PR:**
- [ ] Code follows TypeScript best practices
- [ ] All new code has TypeScript types (no `any`)
- [ ] Components are properly typed
- [ ] No console.logs in production code
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Accessibility checked (keyboard navigation, screen readers)
- [ ] No hardcoded values (use env vars)
- [ ] Database queries use Drizzle ORM (no raw SQL)
- [ ] API routes have proper error responses
- [ ] Sensitive data not exposed in client
- [ ] Tests written (if applicable)

**PR Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Tested on staging
- [ ] Added unit tests
- [ ] Added integration tests

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

---

## 7. Priority Tasks

### Phase 1: Authentication & Core Setup (Week 1-2)

**Task 1.1: Implement NextAuth.js**
- **Priority:** Critical
- **Estimated Time:** 8-12 hours
- **Files to Create:**
  - `src/app/api/auth/[...nextauth]/route.ts`
  - `src/lib/auth.ts`
  - `src/middleware.ts`
- **Requirements:**
  - Email/password authentication
  - Session management
  - Protected routes middleware
  - Password reset flow
- **Testing:** Sign up, sign in, sign out, password reset
- **Documentation:** [NextAuth.js Docs](https://next-auth.js.org)

**Task 1.2: Database Connection & Migrations**
- **Priority:** Critical
- **Estimated Time:** 4-6 hours
- **Files to Create:**
  - `src/db/queries/users.ts`
  - `src/db/queries/profiles.ts`
- **Requirements:**
  - Verify database connection
  - Run initial migrations
  - Create seed data (test users)
  - Test all CRUD operations
- **Testing:** Create, read, update, delete operations

**Task 1.3: Profile Data Persistence**
- **Priority:** Critical
- **Estimated Time:** 12-16 hours
- **Files to Create:**
  - `src/app/api/profiles/route.ts`
  - `src/app/api/profiles/[id]/route.ts`
  - `src/lib/validations.ts` (Zod schemas)
- **Requirements:**
  - Save invitee profile data
  - Save requester profile data
  - Validate all inputs (Zod)
  - Handle file uploads (photos)
- **Testing:** Complete onboarding flow, verify data saved

### Phase 2: Browse & Discovery (Week 3)

**Task 2.1: Browse Invitee Profiles**
- **Priority:** High
- **Estimated Time:** 16-20 hours
- **Files to Create:**
  - `src/app/(dashboard)/browse/page.tsx`
  - `src/components/profile/ProfileCard.tsx`
  - `src/components/profile/ProfileDetail.tsx`
  - `src/app/api/profiles/search/route.ts`
- **Requirements:**
  - Grid/list view toggle
  - Filters (location, age, deposit, intent)
  - Sorting (recommended, newest, distance)
  - Pagination (infinite scroll)
  - Profile detail modal
- **Testing:** Browse, filter, sort, view details

**Task 2.2: Search & Filtering**
- **Priority:** Medium
- **Estimated Time:** 8-12 hours
- **Requirements:**
  - Keyword search
  - Advanced filters
  - Filter persistence (URL params)
  - Clear filters button
- **Testing:** All filter combinations

### Phase 3: Date Request System (Week 4-5)

**Task 3.1: Stripe Integration**
- **Priority:** Critical
- **Estimated Time:** 20-24 hours
- **Files to Create:**
  - `src/lib/stripe.ts`
  - `src/app/api/payments/create-intent/route.ts`
  - `src/app/api/payments/refund/route.ts`
  - `src/app/api/webhooks/stripe/route.ts`
- **Requirements:**
  - Payment Intent creation
  - Stripe Checkout/Elements integration
  - Webhook handling (payment succeeded, failed)
  - Refund logic
  - Error handling
- **Testing:** Test mode payments, refunds, webhooks
- **Documentation:** [Stripe Docs](https://stripe.com/docs)

**Task 3.2: Request Flow**
- **Priority:** Critical
- **Estimated Time:** 16-20 hours
- **Files to Create:**
  - `src/app/(dashboard)/request/[inviteeId]/page.tsx`
  - `src/app/api/requests/route.ts`
  - `src/components/request/ScreeningQuestions.tsx`
  - `src/components/request/PaymentForm.tsx`
- **Requirements:**
  - Answer screening questions
  - Write intro message
  - Select date preferences
  - Pay deposit
  - Request confirmation
- **Testing:** Complete request flow, verify payment

**Task 3.3: Request Management (Invitee)**
- **Priority:** Critical
- **Estimated Time:** 16-20 hours
- **Files to Create:**
  - `src/app/(dashboard)/requests/page.tsx`
  - `src/components/request/RequestCard.tsx`
  - `src/components/request/RequestDetail.tsx`
  - `src/app/api/requests/[id]/approve/route.ts`
  - `src/app/api/requests/[id]/decline/route.ts`
- **Requirements:**
  - Request inbox (tabs: pending, approved, declined)
  - Request detail view
  - Approve/decline actions
  - Refund on decline
  - Chat unlock on approve
- **Testing:** Approve, decline, verify refunds

### Phase 4: Chat System (Week 6)

**Task 4.1: Real-Time Chat**
- **Priority:** High
- **Estimated Time:** 20-24 hours
- **Files to Create:**
  - `src/app/(dashboard)/chats/page.tsx`
  - `src/app/(dashboard)/chats/[id]/page.tsx`
  - `src/components/chat/ChatList.tsx`
  - `src/components/chat/ChatWindow.tsx`
  - `src/app/api/chats/route.ts`
  - `src/app/api/chats/[id]/messages/route.ts`
  - `src/lib/pusher.ts` (or Supabase Realtime)
- **Requirements:**
  - Chat list with unread counts
  - Real-time messaging
  - Typing indicators
  - Read receipts
  - Message validation (no contact info)
- **Testing:** Send messages, real-time updates
- **Documentation:** [Pusher Docs](https://pusher.com/docs) or [Supabase Realtime](https://supabase.com/docs/guides/realtime)

**Task 4.2: Date Confirmation**
- **Priority:** Medium
- **Estimated Time:** 8-12 hours
- **Requirements:**
  - Confirmation trigger (24h after date)
  - Both parties confirm
  - Deposit refund on confirmation
  - No-show reporting
  - Dispute handling
- **Testing:** Confirm date, no-show, dispute

### Phase 5: Verification & Safety (Week 7)

**Task 5.1: Identity Verification**
- **Priority:** Critical
- **Estimated Time:** 12-16 hours
- **Files to Create:**
  - `src/lib/persona.ts`
  - `src/app/api/verification/create-inquiry/route.ts`
  - `src/app/api/webhooks/persona/route.ts`
  - `src/components/verification/VerificationFlow.tsx`
- **Requirements:**
  - Persona integration
  - Selfie + ID upload
  - Webhook handling
  - Verification badge display
- **Testing:** Complete verification flow
- **Documentation:** [Persona Docs](https://docs.withpersona.com)

**Task 5.2: Report & Block System**
- **Priority:** High
- **Estimated Time:** 12-16 hours
- **Files to Create:**
  - `src/app/api/reports/route.ts`
  - `src/app/api/blocks/route.ts`
  - `src/components/safety/ReportModal.tsx`
- **Requirements:**
  - Report form with types
  - Evidence upload
  - Block user functionality
  - Admin review queue (basic)
- **Testing:** Report user, block user

### Phase 6: Polish & Launch Prep (Week 8)

**Task 6.1: Email Notifications**
- **Priority:** High
- **Estimated Time:** 8-12 hours
- **Files to Create:**
  - `src/lib/email.ts`
  - `src/emails/` (React Email templates)
- **Requirements:**
  - Welcome email
  - Request received
  - Request approved/declined
  - Date reminder
  - Verification required
- **Testing:** All email types
- **Documentation:** [Resend Docs](https://resend.com/docs)

**Task 6.2: Settings & Profile Editing**
- **Priority:** Medium
- **Estimated Time:** 12-16 hours
- **Files to Create:**
  - `src/app/(dashboard)/settings/page.tsx`
  - `src/components/settings/ProfileSettings.tsx`
  - `src/components/settings/NotificationSettings.tsx`
- **Requirements:**
  - Edit profile
  - Change password
  - Notification preferences
  - Privacy settings
  - Delete account
- **Testing:** All settings changes

**Task 6.3: Testing & Bug Fixes**
- **Priority:** Critical
- **Estimated Time:** 16-20 hours
- **Requirements:**
  - End-to-end testing
  - Cross-browser testing
  - Mobile responsiveness
  - Performance optimization
  - Bug fixes
- **Testing:** Full user journeys

---

## 8. API Integration Guide

### Stripe Integration

**Setup:**
```bash
npm install stripe @stripe/stripe-js
```

**Server-Side Client:**
```typescript
// src/lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});
```

**Create Payment Intent:**
```typescript
// src/app/api/payments/create-intent/route.ts
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const { amount, requestId } = await req.json();
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount, // in cents
    currency: 'usd',
    payment_method_types: ['card'],
    capture_method: 'manual', // Hold funds
    metadata: { requestId },
  });
  
  return Response.json({ clientSecret: paymentIntent.client_secret });
}
```

**Webhook Handler:**
```typescript
// src/app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;
  
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      // Handle successful payment
      break;
    case 'payment_intent.payment_failed':
      // Handle failed payment
      break;
  }
  
  return Response.json({ received: true });
}
```

**Important:** Test with Stripe CLI for webhooks
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Persona Integration

**Setup:**
```bash
npm install persona
```

**Create Inquiry:**
```typescript
// src/lib/persona.ts
import { Persona } from 'persona';

export const persona = new Persona.Client({
  apiKey: process.env.PERSONA_API_KEY!,
  environment: 'sandbox', // or 'production'
});

export async function createInquiry(userId: string) {
  const inquiry = await persona.inquiries.create({
    inquiry_template_id: process.env.PERSONA_TEMPLATE_ID!,
    reference_id: userId,
  });
  
  return inquiry.attributes.inquiry_url;
}
```

**Webhook Handler:**
```typescript
// src/app/api/webhooks/persona/route.ts
export async function POST(req: Request) {
  const event = await req.json();
  
  if (event.type === 'inquiry.completed') {
    const inquiryId = event.data.id;
    const status = event.data.attributes.status;
    
    if (status === 'approved') {
      // Update user verification status
    }
  }
  
  return Response.json({ received: true });
}
```

### Email Integration (Resend)

**Setup:**
```bash
npm install resend react-email
```

**Send Email:**
```typescript
// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: 'VelvetHold <hello@velvethold.com>',
    to: email,
    subject: 'Welcome to VelvetHold!',
    react: WelcomeEmail({ name }),
  });
}
```

---

## 9. Database Management

### Running Migrations

**Generate Migration:**
```bash
npx drizzle-kit generate
```

**Push to Database:**
```bash
npx drizzle-kit push
```

**View Database:**
```bash
npx drizzle-kit studio
```

### Common Queries

**Create User:**
```typescript
import { db } from '@/db';
import { users } from '@/db/schema';

const user = await db.insert(users).values({
  email: 'user@example.com',
  role: 'requester',
}).returning();
```

**Get Profile with User:**
```typescript
import { eq } from 'drizzle-orm';
import { profiles, users } from '@/db/schema';

const profile = await db.query.profiles.findFirst({
  where: eq(profiles.userId, userId),
  with: {
    user: true,
  },
});
```

**Create Request:**
```typescript
import { dateRequests } from '@/db/schema';

const request = await db.insert(dateRequests).values({
  inviteeId,
  requesterId,
  screeningAnswers: { answers },
  introMessage,
  depositAmount,
}).returning();
```

### Database Best Practices

1. **Always use transactions for multi-step operations:**
```typescript
await db.transaction(async (tx) => {
  const request = await tx.insert(dateRequests).values({...});
  const payment = await tx.insert(payments).values({...});
});
```

2. **Use prepared statements for repeated queries:**
```typescript
const getUserById = db.query.users.findFirst({
  where: eq(users.id, sql.placeholder('id')),
}).prepare();

const user = await getUserById.execute({ id: userId });
```

3. **Index frequently queried fields** (already done in schema)

4. **Use connection pooling** (configured in `src/db/index.ts`)

---

## 10. Testing Strategy

### Unit Tests (Jest + React Testing Library)

**Setup:**
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
```

**Example Component Test:**
```typescript
// src/components/ui/button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Integration Tests (Playwright)

**Setup:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Example E2E Test:**
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign up', async ({ page }) => {
  await page.goto('/auth/signup');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/onboarding');
});
```

### API Tests (Supertest)

**Example:**
```typescript
// tests/api/profiles.test.ts
import request from 'supertest';

describe('POST /api/profiles', () => {
  it('creates a profile', async () => {
    const res = await request(app)
      .post('/api/profiles')
      .send({ displayName: 'Test', age: 25, city: 'NYC' })
      .expect(201);
    
    expect(res.body.profile).toHaveProperty('id');
  });
});
```

### Test Coverage Goals

- Unit tests: >80% coverage
- Integration tests: Critical user flows
- E2E tests: Happy paths + edge cases

---

## 11. Deployment Guide

### Vercel Deployment

**Step 1: Connect Repository**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Select "Next.js" framework

**Step 2: Configure Environment Variables**

Add all variables from `.env.local` to Vercel:
- Database URL
- Stripe keys
- Auth secrets
- API keys

**Step 3: Deploy**
```bash
# Or use Vercel CLI
npm install -g vercel
vercel --prod
```

### Database Setup (Supabase)

**Step 1: Create Project**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string

**Step 2: Run Migrations**
```bash
DATABASE_URL=your-supabase-url npx drizzle-kit push
```

### Custom Domain

1. Add domain in Vercel dashboard
2. Configure DNS records
3. SSL automatically provisioned

### Monitoring

**Set up:**
- Vercel Analytics (built-in)
- Sentry for error tracking
- LogDrain for logs (optional)

---

## 12. Security Checklist

### Before Launch

- [ ] All environment variables in Vercel (not in code)
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] CORS configured (whitelist only)
- [ ] Rate limiting on API routes
- [ ] SQL injection prevention (using Drizzle)
- [ ] XSS prevention (React escapes by default)
- [ ] CSRF protection (NextAuth handles this)
- [ ] Password hashing (bcrypt, cost 12)
- [ ] Session security (JWT signed, httpOnly cookies)
- [ ] File upload validation (type, size, malware scan)
- [ ] Input validation (Zod schemas on all inputs)
- [ ] Error messages don't leak sensitive info
- [ ] Database credentials not exposed
- [ ] API keys not in client code
- [ ] Stripe webhooks verified (signature check)
- [ ] Persona webhooks verified
- [ ] No console.logs in production
- [ ] Dependencies updated (no known vulnerabilities)

### Ongoing

- [ ] Regular security audits
- [ ] Dependency updates (npm audit)
- [ ] Monitor Sentry for errors
- [ ] Review Stripe Radar for fraud
- [ ] Check Vercel logs for anomalies

---

## 13. Performance Targets

### Core Web Vitals

- **LCP (Largest Contentful Paint):** <2.5s
- **FID (First Input Delay):** <100ms
- **CLS (Cumulative Layout Shift):** <0.1

### Page Load Times

- Landing page: <1s
- Browse page: <2s
- Profile page: <1.5s
- Chat page: <2s

### Optimization Techniques

**Images:**
- Use Next.js Image component
- WebP format
- Lazy loading
- Responsive sizes

**Code Splitting:**
- Dynamic imports for heavy components
- Route-based code splitting (automatic)

**Caching:**
- SWR for data fetching
- Vercel Edge caching
- Browser caching headers

**Database:**
- Connection pooling
- Indexed queries
- Pagination (not loading all data)

---

## 14. Support & Resources

### Documentation

- **Product Requirements:** `prd.txt` and `PRD_DETAILED.md`
- **Implementation Guide:** `IMPLEMENTATION.md`
- **This Handoff Guide:** `DEVELOPER_HANDOFF.md`

### External Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Stripe Docs](https://stripe.com/docs)
- [Persona Docs](https://docs.withpersona.com)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Communication

**Questions & Clarifications:**
- Create GitHub issues for technical questions
- Tag issues with `question` label
- Include code snippets and error messages

**Bug Reports:**
- Use GitHub issue template
- Include steps to reproduce
- Add screenshots/videos
- Specify environment (local/staging/production)

**Feature Requests:**
- Reference PRD section
- Explain use case
- Propose implementation approach

### Code Review Process

1. Create feature branch
2. Implement feature
3. Write tests
4. Create pull request
5. Request review
6. Address feedback
7. Merge to develop
8. Deploy to staging
9. Test on staging
10. Merge to main
11. Deploy to production

### Emergency Contacts

- **Product Owner:** [Contact info]
- **Technical Lead:** [Contact info]
- **DevOps:** [Contact info]

---

## Quick Start Checklist

### Day 1
- [ ] Clone repository
- [ ] Install dependencies
- [ ] Set up environment variables
- [ ] Create database
- [ ] Run migrations
- [ ] Start dev server
- [ ] Verify all pages load

### Week 1
- [ ] Implement authentication
- [ ] Set up database queries
- [ ] Create profile persistence
- [ ] Deploy to staging

### Week 2-3
- [ ] Build browse page
- [ ] Implement filters
- [ ] Create profile detail view

### Week 4-5
- [ ] Integrate Stripe
- [ ] Build request flow
- [ ] Implement approval system

### Week 6
- [ ] Add chat functionality
- [ ] Implement real-time updates

### Week 7
- [ ] Add verification
- [ ] Build safety features

### Week 8
- [ ] Email notifications
- [ ] Settings pages
- [ ] Testing & bug fixes
- [ ] Production deployment

---

## Final Notes

**What Makes This Project Unique:**
- Deposit-based accountability (first of its kind)
- Safety-first approach (verification required)
- Clear refund policies (transparency)
- Web-first strategy (avoid app store issues)

**Key Success Factors:**
- User trust (verification, safety, clear policies)
- Payment reliability (Stripe integration)
- Performance (fast, responsive)
- Mobile experience (most users on mobile)

**Common Pitfalls to Avoid:**
- Don't skip verification (critical for safety)
- Don't hardcode deposit amounts (user-configurable)
- Don't expose sensitive data in client
- Don't skip error handling
- Don't forget mobile responsiveness
- Don't skip testing payment flows

**Remember:**
- This is a marketplace (two-sided)
- Invitees are the supply (harder to acquire)
- Requesters are the demand (easier to acquire)
- Focus on invitee experience first
- Safety is non-negotiable

---

**Good luck! You've got everything you need to build an amazing product. 🚀**

**Questions?** Create a GitHub issue or reach out to the product team.

**Last Updated:** January 20, 2026  
**Version:** 1.0  
**Status:** Ready for Development
