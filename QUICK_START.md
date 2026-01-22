# VelvetHold - Quick Start for Autonomous Agents

## 30-Second Overview

**What:** Premium dating platform with refundable deposits
**Status:** 12/65 features complete (18%)
**Current Phase:** Phase 1 ✅ Complete → Phase 2 🔄 Next (Authentication)
**Tech:** Next.js 15 + TypeScript + Tailwind + PostgreSQL + Stripe

## First Actions

```bash
# 1. Read progress
cat claude-progress.txt
cat feature_list.json

# 2. Install & verify
npm install
npm run lint   # Should pass ✅
npm run build  # Should pass ✅

# 3. Start dev server
npm run dev
# Visit http://localhost:3000
```

## Key Files

| File | Purpose |
|------|---------|
| `feature_list.json` | 65 features with completion status |
| `claude-progress.txt` | Session-by-session development log |
| `AUTONOMOUS_AGENT_GUIDE.md` | Complete development guide |
| `prd.txt` | Product requirements |
| `src/db/schema.ts` | Database schema |
| `.env.local` | Environment variables |

## Next Feature: Phase 2 - Authentication

**Blocking Issue:** Database not connected yet

**Implementation Order:**
1. VH-019: Database Connection Setup (P0)
2. VH-020: Database Migrations (P0)
3. VH-013: NextAuth.js Integration (P0)
4. VH-014: Session Management (P0)
5. VH-015: Protected Routes Middleware (P0)
6. VH-016: Password Reset Flow (P1)

## Quick Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint check
npx tsc --noEmit     # Type check
```

## Completion Checklist

When you finish a feature:

- [ ] Feature works and is tested
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] Update `feature_list.json`: `"passes": true, "completedAt": "YYYY-MM-DD"`
- [ ] Update `claude-progress.txt` with session notes

## Need Help?

- **Full guide:** Read `AUTONOMOUS_AGENT_GUIDE.md`
- **Requirements:** Read `prd.txt`
- **Schema:** Check `src/db/schema.ts`
- **Previous work:** Review `claude-progress.txt`

## Brand Colors

```css
Primary:   #3B1E4A  /* Velvet Plum */
Accent:    #E7B7D2  /* Blush Rose */
Secondary: #D7B46A  /* Gilded Gold */
```

---

**Ready to build!** Start with database setup, then authentication.
