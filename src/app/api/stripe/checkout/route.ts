import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { uid } = await verifyAuth(request);
    const db = getAdminDb();

    // Check if user already has a Stripe customer ID
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    let customerId = userData?.stripeCustomerId as string | undefined;

    // Create Stripe customer if needed
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { firebaseUID: uid },
      });
      customerId = customer.id;
      await db.collection('users').doc(uid).set(
        { stripeCustomerId: customerId },
        { merge: true },
      );
    }

    // Determine base URL from request
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: STRIPE_CONFIG.proPriceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: { firebaseUID: uid },
      },
      success_url: `${origin}/interview?upgraded=true`,
      cancel_url: `${origin}/interview`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    if (error instanceof Error && 'type' in error) {
      // Stripe-specific error
      const stripeErr = error as { type: string; message: string; code?: string };
      return NextResponse.json(
        { error: stripeErr.message, code: stripeErr.code },
        { status: 400 },
      );
    }
    return handleAuthError(error);
  }
}
