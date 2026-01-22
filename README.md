# VelvetHold

Premium date reservation platform with deposit-based commitment.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI Library:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **Database:** PostgreSQL with Drizzle ORM
- **Payments:** Stripe

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   └── ...          # Feature components
├── lib/             # Utilities and configurations
└── db/              # Database schema and queries
```

## Environment Variables

Create a `.env.local` file with:

```env
DATABASE_URL=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

## Development Progress

This project is being developed incrementally using autonomous coding agents. Progress is tracked in:

- **`feature_list.json`** - 65 features across 10 phases with completion status
- **`claude-progress.txt`** - Session-by-session development log
- **`prd.txt`** - Complete product requirements document

### Current Status: 12/65 features complete (18%)

**Phase 1 (Infrastructure):** ✅ Complete (12/12)
- Project setup, design system, database schema, basic UI pages

**Phase 2 (Auth):** 🔄 Next (0/6)
- Authentication, session management, protected routes

**Phases 3-10:** ⏳ Pending
- Profiles, Browse, Requests, Management, Chat, Verification, Safety, Polish

### For Autonomous Agents

When working on this project:

1. **Check Progress:** Read `claude-progress.txt` and `feature_list.json` first
2. **Pick Next Feature:** Focus on incomplete features in the current phase (prioritize P0 → P1 → P2)
3. **Test Thoroughly:** Verify the feature works before marking as complete
4. **Update Tracking:**
   - Update `feature_list.json` with `"passes": true` and `"completedAt": "YYYY-MM-DD"`
   - Append progress to `claude-progress.txt` with what was done
5. **Run Tests:** Use `npm run build` and `npm run lint` to catch errors

### Testing Features

To verify a feature is complete:
- UI features: Visual inspection + user flow testing
- API features: Test with curl/Postman or integration tests
- Database features: Check data persistence and relationships
- Build: Must pass `npm run build` without errors

## Learn More

See `prd.txt` for full product requirements and specifications.
