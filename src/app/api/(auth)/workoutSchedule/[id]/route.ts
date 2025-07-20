import { NextRequest, NextResponse } from 'next/server';
import connect from '../../../../../../lib/db';
import WorkoutSchedule, { IWorkout, IDailyWorkout } from '../../../../../../lib/models/workouts';
import mongoose from 'mongoose';

// Helper to extract ID from the request URL
function getIdFromRequest(request: NextRequest): string | null {
  const segments = request.nextUrl.pathname.split('/');
  return segments[segments.length - 1] || null;
}

// GET: Fetch schedule by ID
export async function GET(request: NextRequest) {
  const id = getIdFromRequest(request);

  try {
    await connect();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid schedule ID', { status: 400 });
    }

    const schedule = await WorkoutSchedule.findById(id);
    if (!schedule) {
      return new NextResponse('Schedule not found', { status: 404 });
    }

    return NextResponse.json(schedule, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching schedule';
    return new NextResponse(message, { status: 500 });
  }
}

// PATCH: Update schedule by ID
export async function PATCH(request: NextRequest) {
  const id = getIdFromRequest(request);

  try {
    await connect();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid schedule ID', { status: 400 });
    }

    const schedule = await WorkoutSchedule.findById(id);
    if (!schedule) {
      return new NextResponse('Schedule not found', { status: 404 });
    }

    const body = (await request.json()) as {
      weekDay?: string;
      workouts?: IWorkout[];
      operation?: 'push' | 'pull' | 'replace';
    };

    let updatedSchedule;

    if (body.weekDay && body.operation && body.workouts) {
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      if (!validDays.includes(body.weekDay)) {
        return new NextResponse('Invalid weekDay', { status: 400 });
      }

      // If the day doesn't exist yet, create it
      if (!schedule.schedule.some((s: IDailyWorkout) => s.weekDay === body.weekDay)) {
        await WorkoutSchedule.findByIdAndUpdate(id, {
          $push: { schedule: { weekDay: body.weekDay, workouts: [] } },
        });
      }

      if (body.operation === 'push') {
        updatedSchedule = await WorkoutSchedule.findByIdAndUpdate(
          id,
          { $push: { 'schedule.$[day].workouts': { $each: body.workouts } } },
          { new: true, runValidators: true, arrayFilters: [{ 'day.weekDay': body.weekDay }] }
        );
      } else if (body.operation === 'pull') {
        updatedSchedule = await WorkoutSchedule.findByIdAndUpdate(
          id,
          { $pull: { 'schedule.$[day].workouts': { name: { $in: body.workouts.map(w => w.name) } } } },
          { new: true, runValidators: true, arrayFilters: [{ 'day.weekDay': body.weekDay }] }
        );
      } else if (body.operation === 'replace') {
        updatedSchedule = await WorkoutSchedule.findByIdAndUpdate(
          id,
          { $set: { 'schedule.$[day].workouts': body.workouts } },
          { new: true, runValidators: true, arrayFilters: [{ 'day.weekDay': body.weekDay }] }
        );
      } else {
        return new NextResponse('Invalid operation', { status: 400 });
      }
    } else {
      updatedSchedule = await WorkoutSchedule.findByIdAndUpdate(
        id,
        { $set: body },
        { new: true, runValidators: true }
      );
    }

    if (!updatedSchedule) {
      return new NextResponse('Schedule not found', { status: 404 });
    }

    return NextResponse.json(updatedSchedule, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating schedule';
    return new NextResponse(message, { status: 500 });
  }
}
