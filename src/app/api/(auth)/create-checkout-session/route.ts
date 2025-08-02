// /api/stripe/create-checkout-session.ts


/* NOTES TO SELF:
- This file basically creates a checkout session for a coach to subscribe to a plan after you click on upgrade.
- The redirect url is not working so make sure to fix that. Could be the environment variable not being set correctly.
- Also getting this issue: 'Error: JSON.parse: unexpected end of data at line 1 column 1 of the JSON data'

*/
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import Coach from '../../../../../lib/models/coach';
import connect from '../../../../../lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-07-30.basil' });

export const POST = async (req: Request) => {
  const { coachId } = await req.json();

  await connect();
  const coach = await Coach.findById(coachId);
  if (!coach) return new NextResponse('Coach not found', { status: 404 });

  let customerId = coach.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: coach.email,
      name: coach.name,
    });
    customerId = customer.id;
    await Coach.findByIdAndUpdate(coachId, { stripeCustomerId: customerId });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!, // e.g. "price_1..."
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
};
