import Stripe from 'stripe';
import Coach from '../../../../../../lib/models/coach';
import connect from '../../../../../../lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(req: Request) {
  const { coachId } = await req.json();

  await connect();
  const coach = await Coach.findById(coachId);

  if (!coach) {
    return new Response('Coach not found', { status: 404 });
  }

  try {
    // 1. Cancel subscription in Stripe (if exists)
    if (coach.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(coach.stripeSubscriptionId);
    }

    // 2. Delete coach data in DB
    await Coach.findByIdAndDelete(coachId);

    return new Response('Account deleted successfully', { status: 200 });
  } catch (err) {
    console.error('Error deleting account:', err);
    return new Response('Error deleting account', { status: 500 });
  }
}
