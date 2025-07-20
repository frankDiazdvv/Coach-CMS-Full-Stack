import { NextRequest, NextResponse } from 'next/server';
import connect from '../../../../../../lib/db';
import Coach, { ICoach } from '../../../../../../lib/models/coach';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Helper to get ID from request URL
function getIdFromRequest(request: NextRequest): string | null {
  const segments = request.nextUrl.pathname.split('/');
  // Assuming URL is like /api/(auth)/coaches/[id]
  return segments[segments.length - 1] || null;
}

// GET: Fetch a coach by ID
export async function GET(request: NextRequest) {
  const id = getIdFromRequest(request);

  try {
    await connect();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid coach ID', { status: 400 });
    }

    const coach = await Coach.findById(id);
    if (!coach) {
      return new NextResponse('Coach not found', { status: 404 });
    }

    return NextResponse.json(coach, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching coach';
    return new NextResponse(message, { status: 500 });
  }
}

// PATCH: Update coach by ID
export async function PATCH(request: NextRequest) {
  const id = getIdFromRequest(request);

  try {
    await connect();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid coach ID', { status: 400 });
    }

    const coach = await Coach.findById(id);
    if (!coach) {
      return new NextResponse('Coach not found', { status: 404 });
    }

    const body = (await request.json()) as Partial<ICoach> & { plansOperation?: 'append' | 'remove' };

    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }

    if (body.plans && body.plansOperation) {
      const updateOperation =
        body.plansOperation === 'append'
          ? { $addToSet: { plans: { $each: body.plans } } }
          : { $pull: { plans: { $in: body.plans } } };

      const updatedCoach = await Coach.findByIdAndUpdate(id, updateOperation, {
        new: true,
        runValidators: true,
      });

      return NextResponse.json(updatedCoach, { status: 200 });
    }

    const updatedCoach = await Coach.findByIdAndUpdate(id, { $set: body }, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(updatedCoach, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating coach';
    return new NextResponse(message, { status: 500 });
  }
}

// DELETE: Delete coach by ID
export async function DELETE(request: NextRequest) {
  const id = getIdFromRequest(request);

  try {
    await connect();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid coach ID', { status: 400 });
    }

    const coach = await Coach.findByIdAndDelete(id);
    if (!coach) {
      return new NextResponse('Coach not found', { status: 404 });
    }

    return NextResponse.json({ message: 'Coach deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error deleting coach';
    return new NextResponse(message, { status: 500 });
  }
}
