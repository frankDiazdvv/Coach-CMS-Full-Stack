import { NextResponse } from 'next/server';
import connect from '../../../../../lib/db';
import Client, { IClient } from '../../../../../lib/models/clients';
import WorkoutSchedule, { IWorkout } from '../../../../../lib/models/workouts';
import NutritionSchedule, { INutritionItem } from '../../../../../lib/models/nutrition';
import Coach from '../../../../../lib/models/coach';
import { authMiddleware } from '../../../../../lib/auth';

export async function GET() {
  try {
    await connect();
    console.log('Fetching clients');
    const clients = await Client.find().populate('coach').populate('workoutSchedule').lean();
    return new NextResponse(JSON.stringify(clients), { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching clients"
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

    if (!body.firstName || !body.email || !body.password || !body.phone ||
       !body.gender || !body.goal || !body.currentWeight || !body.planAssigned || !body.coach) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    if (body.coach.toString() !== (auth).id) {
      return new NextResponse('Unauthorized: Coach ID mismatch', { status: 403 });
    }

    const coach = await Coach.findById(body.coach);
    if (!coach) {
      return new NextResponse('Coach not found', { status: 404 });
    }
    if (!coach.plans.includes(body.planAssigned)) {
      return new NextResponse('Plan not found in coach’s plans', { status: 400 });
    }

    const canCreateClient = coach.isSubscribed || coach.clients.lenght < 3;

    if (!canCreateClient) {
      return new Response(
        JSON.stringify({ error: 'Upgrade required to add more than 3 clients.' }),
        { status: 403 }
      );
    }

    const newClient = await Client.create({
      ...body,
      workoutSchedule: undefined,
      nutritionSchedule: undefined,
    });

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