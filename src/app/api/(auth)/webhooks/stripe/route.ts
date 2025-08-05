// /app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import Coach from '../../../../../../lib/models/coach';
import connect from '../../../../../../lib/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const rawBody = await req.text();
  const sig = (await headers()).get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${(err as Error).message}`);
    return new NextResponse(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await connect();

      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      const planName = session.metadata?.planName || 'Unknown';
      const coachId = session.metadata?.coachId;

      console.log('🎯 Metadata from session:', {
        planName,
        coachId,
      });

      // Update the coach document
      const updatedCoach = await Coach.findOneAndUpdate(
        { stripeCustomerId: customerId },
        {
          isSubscribed: true,
          stripeSubscriptionId: subscriptionId,
          planName, // or session.metadata.planName if passed via metadata
        },
        { new: true }
      );

      if (updatedCoach) {
        console.log('✅ Coach subscription updated:', updatedCoach._id);
      } else {
        console.warn('⚠️ No matching coach found for customerId:', customerId);
      }
    } catch (err) {
      console.error('Failed to update coach after subscription:', err);
      return new NextResponse('Webhook processing failed', { status: 500 });
    }
  }

  return new NextResponse('Success', { status: 200 });
}
