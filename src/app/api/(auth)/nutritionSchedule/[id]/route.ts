import { NextRequest, NextResponse } from 'next/server';
import connect from '../../../../../../lib/db';
import NutritionSchedule, { INutritionItem, INutritionDay } from '../../../../../../lib/models/nutrition';
import mongoose from 'mongoose';

// Extract ID from the request URL
function getIdFromRequest(request: NextRequest): string | null {
  const segments = request.nextUrl.pathname.split('/');
  return segments[segments.length - 1] || null;
}

export const GET = async (request: NextRequest) => {
  const id = getIdFromRequest(request);

  try {
    await connect();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid schedule ID', { status: 400 });
    }

    const schedule = await NutritionSchedule.findById(id);
    if (!schedule) {
      return new NextResponse('Schedule not found', { status: 404 });
    }

    return NextResponse.json(schedule, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching schedule";
    return new NextResponse(message, { status: 500 });
  }
};

export const PATCH = async (request: NextRequest) => {
  const id = getIdFromRequest(request);

  try {
    await connect();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid schedule ID', { status: 400 });
    }

    const schedule = await NutritionSchedule.findById(id);
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

      if (!schedule.schedule.some((s: INutritionDay) => s.weekDay === body.weekDay)) {
        await NutritionSchedule.findByIdAndUpdate(id, {
          $push: { schedule: { weekDay: body.weekDay, items: [] } },
        });
      }

      if (body.operation === 'push') {
        updatedSchedule = await NutritionSchedule.findByIdAndUpdate(
          id,
          { $push: { 'schedule.$[day].items': { $each: body.items } } },
          { new: true, runValidators: true, arrayFilters: [{ 'day.weekDay': body.weekDay }] }
        );
      } else if (body.operation === 'pull') {
        updatedSchedule = await NutritionSchedule.findByIdAndUpdate(
          id,
          { $pull: { 'schedule.$[day].items': { food: { $in: body.items.map((i) => i.foods) } } } },
          { new: true, runValidators: true, arrayFilters: [{ 'day.weekDay': body.weekDay }] }
        );
      } else if (body.operation === 'replace') {
        updatedSchedule = await NutritionSchedule.findByIdAndUpdate(
          id,
          { $set: { 'schedule.$[day].items': body.items } },
          { new: true, runValidators: true, arrayFilters: [{ 'day.weekDay': body.weekDay }] }
        );
      } else {
        return new NextResponse('Invalid operation', { status: 400 });
      }
    } else {
      updatedSchedule = await NutritionSchedule.findByIdAndUpdate(
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
    const message = error instanceof Error ? error.message : "Error updating schedule";
    return new NextResponse(message, { status: 500 });
  }
};
