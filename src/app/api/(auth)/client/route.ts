import { NextResponse } from 'next/server';
import connect from '../../../../../lib/db';
import Client, { IClient } from '../../../../../lib/models/clients';
import WorkoutSchedule, { IWorkout } from '../../../../../lib/models/workouts';
import NutritionSchedule, { INutritionItem } from '../../../../../lib/models/nutrition';
import Coach from '../../../../../lib/models/coach';
import { authMiddleware } from '../../../../../lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil', // API version
});


export async function GET() {
  try {
    await connect();
    console.log('Fetching clients');
    const clients = await Client.find().populate('coach').populate('workoutSchedule').lean();
    return new NextResponse(JSON.stringify(clients), { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching clients";
    return new NextResponse(message, { status: 500 });
  }
}

export const POST = async (request: Request) => {
  console.log('POST /api/clients called');
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await connect();
    const body = await request.json() as Partial<IClient> & {
      workoutSchedule?: { schedule: { weekDay: string; workouts: IWorkout[] }[] };
      nutritionSchedule?: { schedule: { weekDay: string; items: INutritionItem[] }[] };
    };

    const requiredFields = ['firstName', 'email', 'password', 'phone', 'gender', 'goal', 'currentWeight', 'planAssigned', 'coach'];
    for (const field of requiredFields) {
      if (!body[field as keyof typeof body]) {
        return new NextResponse(`Missing field: ${field}`, { status: 400 });
      }
    }

    if (body.coach?.toString() !== (auth).id) {
      return new NextResponse('Unauthorized: Coach ID mismatch', { status: 403 });
    }

    const coach = await Coach.findById(body.coach);
    if (!coach) {
      return new NextResponse('Coach not found', { status: 404 });
    }
    if (!coach.plans.includes(body.planAssigned)) {
      return new NextResponse('Plan not found in coach’s plans', { status: 400 });
    }

    // Check client limit and subscription status
    const FREE_CLIENT_LIMIT = 3;
    const BASIC_PAID_LIMIT = 15;

    if (!coach.isSubscribed && coach.clientCount >= FREE_CLIENT_LIMIT) {
      // First, check if they have a Stripe customer
      if (!coach.stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: coach.email,
          name: coach.name,
        });

        await Coach.findByIdAndUpdate(coach._id, { stripeCustomerId: customer.id });
        coach.stripeCustomerId = customer.id;
      }

      // Now check if there's an active subscription
      const subscriptions = await stripe.subscriptions.list({
        customer: coach.stripeCustomerId,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        return new NextResponse(
          JSON.stringify({
            error: 'Free limit reached. Please subscribe to add more clients.',
            redirectToCheckout: true,
          }),
          { status: 403 }
        );
      }

      // Update coach subscription status if active sub is found
      coach.isSubscribed = true;
      await coach.save();
    }

    if (coach.isSubscribed && coach.clientCount >= BASIC_PAID_LIMIT) {
      return new NextResponse(
        JSON.stringify({ error: 'Maximum of 10 clients reached for your current plan.' }),
        { status: 403 }
      );
    }


    const newClient = await Client.create({
      ...body,
      workoutSchedule: undefined,
      nutritionSchedule: undefined,
    });

    // Increment clientCount
    await Coach.findByIdAndUpdate(coach._id, { $inc: { clientCount: 1 } });

    // Create empty workout schedule if not provided
    const workoutScheduleData = body.workoutSchedule?.schedule || [];
    const workoutSchedule = await WorkoutSchedule.create({
      client: newClient._id,
      coach: body.coach,
      schedule: Array.isArray(workoutScheduleData) ? workoutScheduleData : [],
    });
    const workoutScheduleId = workoutSchedule._id;

    // Create empty nutrition schedule if not provided
    const nutritionScheduleData = body.nutritionSchedule?.schedule || [];
    const nutritionSchedule = await NutritionSchedule.create({
      client: newClient._id,
      coach: body.coach,
      schedule: Array.isArray(nutritionScheduleData) ? nutritionScheduleData : [],
    });
    const nutritionScheduleId = nutritionSchedule._id;

    // Update client with schedule IDs
    const updatedClient = await Client.findByIdAndUpdate(
      newClient._id,
      { $set: { workoutSchedule: workoutScheduleId, nutritionSchedule: nutritionScheduleId } },
      { new: true }
    ).populate('workoutSchedule').populate('nutritionSchedule');


    return new NextResponse(JSON.stringify(updatedClient), { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating client"
    return new NextResponse(message, { status: 500 });
  }
};