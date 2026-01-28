# VelvetHold Deployment Guide

## Overview

VelvetHold is configured for deployment on Vercel with the following setup:

## Prerequisites

- Vercel account
- PostgreSQL database (recommended: Neon, Supabase, or similar)
- Uploadthing account for file uploads
- NextAuth secret
- SMTP server for email notifications
- Stripe account for payments

## Environment Variables

Configure the following environment variables in your Vercel project settings:

### Database
```
DATABASE_URL=postgresql://user:password@host:port/database
```

### Authentication
```
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
```

### File Upload
```
UPLOADTHING_SECRET=<your-uploadthing-secret>
UPLOADTHING_APP_ID=<your-uploadthing-app-id>
```

### Email (Resend)
```
RESEND_API_KEY=<your-resend-api-key>
FROM_EMAIL=noreply@your-domain.com
```

### Payment (Stripe)
```
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_PUBLIC_KEY=<your-stripe-public-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
```

## Deployment Steps

1. **Build Verification**
   ```bash
   npm run build
   ```
   Ensure the build completes without errors.

2. **Push to Git**
   ```bash
   git push origin main
   ```

3. **Deploy to Vercel**
   - Import your repository in Vercel dashboard
   - Configure environment variables
   - Deploy

4. **Database Setup**
   - Run migrations on your production database
   - Ensure database is accessible from Vercel

5. **Verify Deployment**
   - Test authentication flow
   - Verify file uploads work
   - Test payment integration
   - Confirm email notifications are sent

## Cron Jobs

The application includes a cron job configured in `vercel.json`:
- **Cleanup expired date requests**: Runs at 3 AM UTC daily
- Path: `/api/cron/cleanup-expired-requests`

## Post-Deployment

After deployment:
1. Test all critical user flows
2. Monitor error logs in Vercel dashboard
3. Set up alerts for critical errors
4. Configure custom domain (if needed)

## Troubleshooting

### Build Errors
- Ensure all environment variables are set
- Check TypeScript compilation errors
- Verify database schema matches application code

### Runtime Errors
- Check Vercel logs for error details
- Verify environment variables are correctly set
- Ensure database is accessible

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check database allows connections from Vercel IPs
- Ensure SSL is properly configured if required
