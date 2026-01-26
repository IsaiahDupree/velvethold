import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

export const STRIPE_CONFIG = {
  currency: 'usd',
  depositAmount: 5000, // $50.00 in cents
  applicationFee: 500, // $5.00 platform fee in cents
} as const;
