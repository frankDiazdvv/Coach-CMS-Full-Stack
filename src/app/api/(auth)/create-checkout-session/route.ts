import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import Coach from '../../../../../lib/models/coach';
import connect from '../../../../../lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export const POST = async (req: Request) => {
  try {
    const body = await req.text();
    console.log('Raw request body:', body);

    const baseUrl = process.env.PUBLIC_BASE_URL;


    const { coachId, priceId, locale } = JSON.parse(body);
    console.log('Parsed coachId:', coachId);
    console.log('Parsed priceId:', priceId);

    if (!coachId || !priceId) {
      return new NextResponse('Missing coachId or priceId', { status: 400 });
    }

    await connect();
    const coach = await Coach.findById(coachId);
    if (!coach) return new NextResponse('Coach not found', { status: 404 });

    let customerId = coach.stripeCustomerId;
    let selectedPlanName = coach.planName;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: coach.email,
        name: coach.name,
      });
      customerId = customer.id;
      await Coach.findByIdAndUpdate(coachId, { 
        stripeCustomerId: customerId,
        planName: selectedPlanName, // Set default plan name
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/${locale}/coach/coach-dashboard?success=1`,
      cancel_url: `${baseUrl}/${locale}/coach/coach-dashboard?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
