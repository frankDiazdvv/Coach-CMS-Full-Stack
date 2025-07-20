import { NextRequest, NextResponse } from 'next/server';
import connect from '../../../../../../lib/db';
import Client, { IClient } from '../../../../../../lib/models/clients';
import WorkoutSchedule from '../../../../../../lib/models/workouts';
import NutritionSchedule from '../../../../../../lib/models/nutrition';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import WorkoutLog from '../../../../../../lib/models/workoutLogs';

function getIdFromRequest(request: NextRequest): string | null {
  const segments = request.nextUrl.pathname.split('/');
  return segments[segments.length - 1] || null;
}

// GET request
export async function GET(request: NextRequest) {
  try {
    await connect();
    const id = getIdFromRequest(request);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid client ID', { status: 400 });
    }

    const client = await Client.findById(id)
      .populate('workoutSchedule')
      .populate('nutritionSchedule');

    if (!client) {
      return new NextResponse('Client not found', { status: 404 });
    }

    return new NextResponse(JSON.stringify(client), { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching client';
    return new NextResponse(message, { status: 500 });
  }
}

// PATCH request
export async function PATCH(request: NextRequest) {
  try {
    await connect();
    const id = getIdFromRequest(request);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid client ID', { status: 400 });
    }

    const client = await Client.findById(id).populate('coach');
    if (!client) {
      return new NextResponse('Client not found', { status: 404 });
    }

    const body = (await request.json()) as Partial<IClient> & {
      workoutSchedule?: { schedule: { weekDay: string; workouts: any[] }[] };
      nutritionSchedule?: { schedule: { weekDay: string; items: any[] }[] };
    };

    if (body.password && body.password.trim() !== '') {
      body.password = await bcrypt.hash(body.password, 10);
    } else {
      body.password = client.password;
    }

    if (body.workoutSchedule) {
      if (client.workoutSchedule) {
        await WorkoutSchedule.findByIdAndUpdate(client.workoutSchedule, {
          $set: { schedule: body.workoutSchedule.schedule },
        });
      } else {
        const newSchedule = await WorkoutSchedule.create({
          client: client._id,
          coach: body.coach || client.coach,
          schedule: body.workoutSchedule.schedule,
        });
        body.workoutSchedule = newSchedule._id;
      }
    }

    if (body.nutritionSchedule) {
      if (client.nutritionSchedule) {
        await NutritionSchedule.findByIdAndUpdate(client.nutritionSchedule, {
          $set: { schedule: body.nutritionSchedule.schedule },
        });
      } else {
        const newSchedule = await NutritionSchedule.create({
          client: client._id,
          coach: body.coach || client.coach,
          schedule: body.nutritionSchedule.schedule,
        });
        body.nutritionSchedule = newSchedule._id;
      }
    }

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate('workoutSchedule')
      .populate('nutritionSchedule');

    if (!updatedClient) {
      return new NextResponse('Failed to update client', { status: 500 });
    }

    return new NextResponse(JSON.stringify(updatedClient), { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating client';
    return new NextResponse(message, { status: 500 });
  }
}

// DELETE request
export async function DELETE(request: NextRequest) {
  try {
    await connect();
    const id = getIdFromRequest(request);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid client ID', { status: 400 });
    }

    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return new NextResponse('Client not found', { status: 404 });
    }

    if (client.workoutSchedule) {
      await WorkoutSchedule.findByIdAndDelete(client.workoutSchedule._id);
    }

    if (client.nutritionSchedule) {
      await NutritionSchedule.findByIdAndDelete(client.nutritionSchedule._id);
    }

    await WorkoutLog.deleteMany({ client: id });

    return new NextResponse(JSON.stringify({ message: 'Client deleted successfully' }), {
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error deleting client';
    return new NextResponse(message, { status: 500 });
  }
}
