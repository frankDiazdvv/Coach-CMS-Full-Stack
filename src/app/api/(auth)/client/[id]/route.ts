import { NextResponse } from 'next/server';
import connect from '../../../../../../lib/db';
import Client, { IClient } from '../../../../../../lib/models/clients';
import WorkoutSchedule from '../../../../../../lib/models/workouts';
import NutritionSchedule from '../../../../../../lib/models/nutrition';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Coach from '../../../../../../lib/models/coach';
import WorkoutLog from '../../../../../../lib/models/workoutLogs';

export const GET = async (request: Request, { params }: { params: { id: string } }) => {
  try {
    await connect();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return new NextResponse('Invalid client ID', { status: 400 });
    }
    const client = await Client.findById(params.id)
      .populate('workoutSchedule')
      .populate('nutritionSchedule');
    if (!client) {
      return new NextResponse('Client not found', { status: 404 });
    }
    return new NextResponse(JSON.stringify(client), { status: 200 });
  } catch (error: any) {
    return new NextResponse('Error fetching client: ' + error.message, { status: 500 });
  }
};

export const PATCH = async (request: Request, { params }: { params: { id: string } }) => {
  try {
    await connect();
    console.log('PATCH request for client ID:', params.id); // Debug log
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return new NextResponse('Invalid client ID', { status: 400 });
    }
    const client = await Client.findById(params.id).populate('coach');
    if (!client) {
      return new NextResponse('Client not found', { status: 404 });
    }
    const body = await request.json() as Partial<IClient> & {
      workoutSchedule?: { schedule: { weekDay: string; workouts: any[] }[] };
      nutritionSchedule?: { schedule: { weekDay: string; items: any[] }[] };
    };

   // Hash password if provided
    if (body.password && body.password.trim() !== '') {
      body.password = await bcrypt.hash(body.password, 10);
    } else {
      // Retain existing password to satisfy required constraint
      body.password = client.password;
    }

    // Update or create WorkoutSchedule
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

    // Update or create NutritionSchedule
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

    // Update client with new data
    const updatedClient = await Client.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('workoutSchedule').populate('nutritionSchedule');

    if (!updatedClient) {
      return new NextResponse('Failed to update client', { status: 500 });
    }
    
    return new NextResponse(JSON.stringify(updatedClient), { status: 200 });
  } catch (error: any) {
    
    return new NextResponse('Error updating client: ' + error.stack, { status: 500 });
  }
};

export const DELETE = async (request: Request, { params }: { params: { id: string } }) => {
  try {
    await connect();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return new NextResponse('Invalid client ID', { status: 400 });
    }
    const client = await Client.findByIdAndDelete(params.id);
    if (!client) {
      return new NextResponse('Client not found', { status: 404 });
    }
    if (client.workoutSchedule) {
      await WorkoutSchedule.findByIdAndDelete(client.workoutSchedule._id);
    }
    if (client.nutritionSchedule) {
      await NutritionSchedule.findByIdAndDelete(client.nutritionSchedule._id);
    }

    // Delete associated workout logs
    await WorkoutLog.deleteMany({ client: params.id });
    return new NextResponse(JSON.stringify({ message: 'Client deleted successfully' }), { status: 200 });
  } catch (error: any) {
    return new NextResponse('Error deleting client: ' + error.message, { status: 500 });
  }
};