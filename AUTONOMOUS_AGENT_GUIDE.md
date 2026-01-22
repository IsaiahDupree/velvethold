# VelvetHold - Autonomous Agent Development Guide

## Quick Start for Autonomous Agents

This document provides everything an autonomous coding agent needs to continue development on VelvetHold.

## Project Overview

**VelvetHold** is a premium dating platform with refundable deposits that ensure serious intentions and eliminate no-shows.

**Core Concept:**
- **Invitees:** Set their availability, screening questions, and deposit amount. Review and approve/decline date requests.
- **Requesters:** Browse profiles, send date requests with refundable deposits, and connect after approval.

**Tech Stack:**
- Next.js 15 (App Router)
- TypeScript + React 19
- Tailwind CSS v4
- shadcn/ui + Radix UI
- PostgreSQL + Drizzle ORM
- Stripe (payments)
- NextAuth.js (authentication)
- Persona (identity verification)

## Current Status

**Progress:** 12/65 features complete (18%)

**Completed:** Phase 1 - Infrastructure (100%)
- Next.js setup, Tailwind, shadcn/ui, database schema, landing page, auth UI, onboarding UI

**Next Up:** Phase 2 - Authentication (0%)
- NextAuth.js integration, session management, protected routes

## Essential Files

### Progress Tracking
- **`feature_list.json`** - 65 features with completion status, priorities, and phases
- **`claude-progress.txt`** - Session log of all development work
- **`prd.txt`** - Complete product requirements document

### Code
- **`src/db/schema.ts`** - Complete database schema (users, profiles, requests, payments, chats)
- **`src/app/`** - Next.js pages and routes
- **`src/components/ui/`** - shadcn/ui components
- **`tailwind.config.ts`** - Brand colors and design tokens

### Configuration
- **`.env.local`** - Environment variables (DATABASE_URL, STRIPE_*, NEXTAUTH_*)
- **`package.json`** - Dependencies and scripts
- **`drizzle.config.ts`** - Database migrations config

## Development Workflow

### 1. Start Your Session

```bash
# Read progress files
cat claude-progress.txt
cat feature_list.json

# Identify next feature to implement
# Prioritize: P0 → P1 → P2 within current phase
```

### 2. Implement Feature

```bash
# Run dev server
npm run dev

# Make changes
# Test manually at http://localhost:3000

# Verify build
npm run build
npm run lint
```

### 3. Update Progress

**In `feature_list.json`:**
```json
{
  "id": "VH-XXX",
  "passes": true,
  "completedAt": "2026-01-21"
}
```

**In `claude-progress.txt`:**
```
## Session X: [Feature Name] - YYYY-MM-DD

### Work Completed
- Implemented [feature details]
- Added [files/changes]
- Tested [test scenarios]

### Status
✅ VH-XXX: [Feature Name]

### Next Steps
- [Next feature to implement]
```

## Feature Implementation Checklist

Before marking a feature as complete:

- [ ] Code implemented and follows existing patterns
- [ ] ESLint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Manual testing completed
- [ ] No TypeScript errors
- [ ] Database schema changes migrated (if applicable)
- [ ] Environment variables documented (if new ones added)
- [ ] `feature_list.json` updated with `"passes": true`
- [ ] `claude-progress.txt` updated with session notes

## Phase-by-Phase Guide

### Phase 2: Authentication (Next)

**Blockers:** Database needs to be connected before auth can be fully functional

**Features:**
1. VH-013: NextAuth.js Integration (P0) - Set up NextAuth with credentials provider
2. VH-014: Session Management (P0) - Session context and hooks
3. VH-015: Protected Routes Middleware (P0) - Middleware to protect authenticated routes
4. VH-016: Password Reset Flow (P1) - Email-based password reset
5. VH-017: Email Verification (P1) - Verify email addresses
6. VH-018: Two-Factor Authentication (P2) - Optional 2FA

**Implementation Order:**
1. Set up database connection (VH-019, VH-020)
2. Install and configure NextAuth.js
3. Create auth API routes
4. Add session provider to layout
5. Implement protected route middleware
6. Connect sign-up/sign-in forms to backend
7. Add password reset and email verification flows

### Phase 3: Profiles & Database

**Features:**
- Database connection setup (VH-019)
- Database migrations (VH-020)
- User CRUD queries (VH-021)
- Profile CRUD queries (VH-022)
- Profile API routes (VH-023)
- Zod validation schemas (VH-024)
- Photo upload system (VH-025)
- Profile data persistence (VH-026)
- Availability settings storage (VH-027)

### Phase 4: Browse & Discovery

**Features:**
- Browse page layout
- ProfileCard component
- ProfileDetail component
- Profile search API
- Browse filters
- Infinite scroll pagination

### Phase 5: Date Requests & Payments

**Features:**
- Stripe client setup
- Payment intent creation
- Stripe webhook handler
- Refund processing
- Request creation page
- Screening questions form
- Payment form component
- Request API routes

### Phase 6: Request Management

**Features:**
- Request inbox page
- RequestCard component
- RequestDetail component
- Approve/decline APIs
- Request expiration handling

### Phase 7: Chat System

**Features:**
- Chat list page
- ChatWindow component
- Real-time messaging
- Chat API routes
- Date confirmation flow
- Message safety features

### Phase 8: Identity Verification

**Features:**
- Persona client setup
- Create inquiry API
- Persona webhook handler
- Verification flow UI

### Phase 9: Safety & Moderation

**Features:**
- Report system
- Block user functionality
- Content moderation

### Phase 10: Polish & Deployment

**Features:**
- Email notifications
- Settings page
- Profile editing
- E2E testing
- Production deployment

## Code Patterns to Follow

### Component Structure
```tsx
// Use shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Follow existing naming: PascalCase for components
export default function FeaturePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3B1E4A]/5 via-[#5A2D82]/5 to-[#E7B7D2]/5 p-4">
      {/* Content */}
    </div>
  );
}
```

### API Routes (App Router)
```tsx
// src/app/api/[feature]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate with Zod
    // Process request
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Database Queries
```ts
// src/db/queries/[feature].ts
import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserById(userId: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: { profile: true },
  });
}
```

### Form Validation
```ts
// Use Zod schemas
import { z } from "zod";

export const profileSchema = z.object({
  displayName: z.string().min(2).max(100),
  age: z.number().min(18).max(120),
  city: z.string().min(2).max(100),
  bio: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
```

## Brand Colors Reference

```css
/* Primary */
--color-primary: #3B1E4A;        /* Velvet Plum */
--color-primary-hover: #5A2D82;  /* Royal Velvet */

/* Accent */
--color-accent: #E7B7D2;         /* Blush Rose */
--color-secondary: #D7B46A;      /* Gilded Gold */

/* Backgrounds */
--color-bg-light: #FAF7FB;       /* Porcelain */
--color-bg-dark: #0B0A10;        /* Ink */
--color-surface-light: #F0EAF3;  /* Soft Lilac */
--color-surface-dark: #171223;   /* Dark Lilac */
```

## Common Issues & Solutions

### Database Connection Errors
- Ensure DATABASE_URL is set in `.env.local`
- Check PostgreSQL is running
- Run migrations: `npm run db:push` (after setup)

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`
- Check for unescaped characters (use `&apos;` instead of `'` in JSX)

### TypeScript Errors
- Check imports match exact file paths
- Ensure types are exported from schema
- Use `@/` path alias for imports

## Testing Strategy

### Manual Testing Checklist
- [ ] Page loads without errors
- [ ] Forms validate correctly
- [ ] API endpoints return expected data
- [ ] Database operations persist data
- [ ] UI matches brand design
- [ ] Responsive on mobile and desktop
- [ ] No console errors in browser

### Before Marking Complete
```bash
# 1. Lint
npm run lint

# 2. Type check
npm run build

# 3. Manual test
npm run dev
# Test feature at http://localhost:3000

# 4. Update tracking files
# - feature_list.json: "passes": true
# - claude-progress.txt: append session notes
```

## Environment Setup

Required environment variables in `.env.local`:

```env
# Database (required for Phase 2+)
DATABASE_URL=postgresql://user:password@localhost:5432/velvethold

# Stripe (required for Phase 5)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# NextAuth (required for Phase 2)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Persona (required for Phase 8)
PERSONA_API_KEY=
PERSONA_TEMPLATE_ID=
```

## Getting Help

- **PRD:** Read `prd.txt` for product requirements
- **Schema:** Check `src/db/schema.ts` for data models
- **Progress:** Review `claude-progress.txt` for context
- **Features:** Check `feature_list.json` for all features

## Final Checklist

Before ending your session:

- [ ] All implemented features tested and working
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] `feature_list.json` updated for all completed features
- [ ] `claude-progress.txt` updated with session summary
- [ ] No uncommitted breaking changes
- [ ] Next feature identified for next session

---

**Happy coding! Build something amazing.**
