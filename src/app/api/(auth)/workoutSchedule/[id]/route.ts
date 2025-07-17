import { NextResponse } from 'next/server';
import connect from '../../../../../../lib/db';
import WorkoutSchedule, { IWorkoutSchedule, IWorkout, IDailyWorkout } from '../../../../../../lib/models/workouts';
import mongoose from 'mongoose';


export const GET = async (request: Request, { params }: { params: { id: string } }) => {
  try {
    await connect();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return new NextResponse('Invalid schedule ID', { status: 400 });
    }
    const schedule = await WorkoutSchedule.findById( params.id);
    if (!schedule) {
      return new NextResponse('Schedule not found', { status: 404 });
    }
    return new NextResponse(JSON.stringify(schedule), { status: 200 });
  } catch (error: any) {
    return new NextResponse('Error fetching schedule: ' + error.message, { status: 500 });
  }
};

export const PATCH = async (request: Request, { params }: { params: { id: string } }) => {
  try {
    await connect();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return new NextResponse('Invalid schedule ID', { status: 400 });
    }
    const schedule = await WorkoutSchedule.findById(params.id);
    if (!schedule) {
      return new NextResponse('Schedule not found', { status: 404 });
    }
    const body = await request.json() as {
      weekDay?: string;
      workouts?: IWorkout[];
      operation?: 'push' | 'pull' | 'replace';
    };
    let updatedSchedule;

    if (body.weekDay && body.operation && body.workouts) {
      // Validate weekDay
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      if (!validDays.includes(body.weekDay)) {
        return new NextResponse('Invalid weekDay', { status: 400 });
      }
      // Ensure the day exists in the schedule
      if (!schedule.schedule.some((s: IDailyWorkout) => s.weekDay === body.weekDay)) {
        await WorkoutSchedule.findByIdAndUpdate(params.id, {
          $push: { schedule: { weekDay: body.weekDay, workouts: [] } },
        });
      }
      if (body.operation === 'push') {
        updatedSchedule = await WorkoutSchedule.findByIdAndUpdate(
          params.id,
          { $push: { 'schedule.$[day].workouts': { $each: body.workouts } } },
          { new: true, runValidators: true, arrayFilters: [{ 'day.weekDay': body.weekDay }] }
        );
      } else if (body.operation === 'pull') {
        updatedSchedule = await WorkoutSchedule.findByIdAndUpdate(
          params.id,
          { $pull: { 'schedule.$[day].workouts': { name: { $in: body.workouts.map((w) => w.name) } } } },
          { new: true, runValidators: true, arrayFilters: [{ 'day.weekDay': body.weekDay }] }
        );
      } else if (body.operation === 'replace') {
        updatedSchedule = await WorkoutSchedule.findByIdAndUpdate(
          params.id,
          { $set: { 'schedule.$[day].workouts': body.workouts } },
          { new: true, runValidators: true, arrayFilters: [{ 'day.weekDay': body.weekDay }] }
        );
      } else {
        return new NextResponse('Invalid operation', { status: 400 });
      }
    } else {
      updatedSchedule = await WorkoutSchedule.findByIdAndUpdate(
        params.id,
        { $set: body },
        { new: true, runValidators: true }
      );
    }

    if (!updatedSchedule) {
      return new NextResponse('Schedule not found', { status: 404 });
    }
    return new NextResponse(JSON.stringify(updatedSchedule), { status: 200 });
  } catch (error: any) {
    return new NextResponse('Error updating schedule: ' + error.message, { status: 500 });
  }
};