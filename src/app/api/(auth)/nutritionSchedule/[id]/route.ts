import { NextResponse } from 'next/server';
import connect from '../../../../../../lib/db';
import NutritionSchedule, { INutritionSchedule, INutritionItem, IDailyNutrition } from '../../../../../../lib/models/nutrition';
import mongoose from 'mongoose';

export const GET = async (request: Request, { params }: { params: { id: string } }) => {
  try {
    await connect();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return new NextResponse('Invalid schedule ID', { status: 400 });
    }
    const schedule = await NutritionSchedule.findById(params.id);
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
    const schedule = await NutritionSchedule.findById(params.id);
    if (!schedule) {
      return new NextResponse('Schedule not found', { status: 404 });
    }
    const body = await request.json() as {
      weekDay?: string;
      items?: INutritionItem[];
      operation?: 'push' | 'pull' | 'replace';
    };
    let updatedSchedule;

    if (body.weekDay && body.operation && body.items) {
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      if (!validDays.includes(body.weekDay)) {
        return new NextResponse('Invalid weekDay', { status: 400 });
      }
      if (!schedule.schedule.some((s: IDailyNutrition) => s.weekDay === body.weekDay)) {
        await NutritionSchedule.findByIdAndUpdate(params.id, {
          $push: { schedule: { weekDay: body.weekDay, items: [] } },
        });
      }
      if (body.operation === 'push') {
        updatedSchedule = await NutritionSchedule.findByIdAndUpdate(
          params.id,
          { $push: { 'schedule.$[day].items': { $each: body.items } } },
          { new: true, runValidators: true, arrayFilters: [{ 'day.weekDay': body.weekDay }] }
        );
      } else if (body.operation === 'pull') {
        updatedSchedule = await NutritionSchedule.findByIdAndUpdate(
          params.id,
          { $pull: { 'schedule.$[day].items': { food: { $in: body.items.map((i) => i.food) } } } },
          { new: true, runValidators: true, arrayFilters: [{ 'day.weekDay': body.weekDay }] }
        );
      } else if (body.operation === 'replace') {
        updatedSchedule = await NutritionSchedule.findByIdAndUpdate(
          params.id,
          { $set: { 'schedule.$[day].items': body.items } },
          { new: true, runValidators: true, arrayFilters: [{ 'day.weekDay': body.weekDay }] }
        );
      } else {
        return new NextResponse('Invalid operation', { status: 400 });
      }
    } else {
      updatedSchedule = await NutritionSchedule.findByIdAndUpdate(
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