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
```

## Learn More

See `prd.txt` for full product requirements and specifications.
