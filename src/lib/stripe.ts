import Stripe from 'stripe';

if (!process.env.STRIPE_API_KEY) {
  throw new Error('STRIPE_API_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2025-03-31.basil' as Stripe.LatestApiVersion,
  typescript: true,
});

export const STRIPE_CONFIG = {
  proPriceId: 'price_1T79WdDOXJcuf332flWN3dmp',
} as const;
