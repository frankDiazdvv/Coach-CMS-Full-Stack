//DYNAMIC ROUTES FOR COACHES

import { NextResponse } from 'next/server';
import connect from "../../../../../../lib/db";
import Coach, { ICoach } from '../../../../../../lib/models/coach';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// GET: Fetch a coach by ID
export const GET = async (request: Request, { params }: { params: { id: string } }) => {
  try {
    await connect();
    
    // Checks for ObjectId in url
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return new NextResponse('Invalid coach ID', { status: 400 });
    }

    const coach = await Coach.findById(params.id);
    if (!coach) {
      return new NextResponse('Coach not found', { status: 404 });
    }

    return new NextResponse(JSON.stringify(coach), { status: 200 });
  } catch (error: any) {
    return new NextResponse('Error fetching coach: ' + error.message, { status: 500 });
  }
};

// PATCH: Update any coach data
export const PATCH = async (request: Request, { params }: { params: { id: string } }) => {
  try {
    await connect();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return new NextResponse('Invalid coach ID', { status: 400 });
    }
    const coach = await Coach.findById(params.id);
    if (!coach) {
      return new NextResponse('Coach not found', { status: 404 });
    }
    const body = await request.json() as Partial<ICoach> & { plansOperation?: 'append' | 'remove' };

    // Hash password if provided
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }

    if (body.plans && body.plansOperation) {
      if (body.plansOperation === 'append') {
        const updatedCoach = await Coach.findByIdAndUpdate(
          params.id,
          { $addToSet: { plans: { $each: body.plans } } },
          { new: true, runValidators: true }
        );
        return new NextResponse(JSON.stringify(updatedCoach), { status: 200 });
      } else if (body.plansOperation === 'remove') {
        const updatedCoach = await Coach.findByIdAndUpdate(
          params.id,
          { $pull: { plans: { $in: body.plans } } },
          { new: true, runValidators: true }
        );
        return new NextResponse(JSON.stringify(updatedCoach), { status: 200 });
      }
    }
    const updatedCoach = await Coach.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );
    return new NextResponse(JSON.stringify(updatedCoach), { status: 200 });
  } catch (error: any) {
    return new NextResponse('Error updating coach: ' + error.message, { status: 500 });
  }
};

// DELETE: Delete a coach account
export const DELETE = async (request: Request, { params }: { params: { id: string } }) => {
  try {
    await connect();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return new NextResponse('Invalid coach ID', { status: 400 });
    }

    const coach = await Coach.findByIdAndDelete(params.id);
    if (!coach) {
      return new NextResponse('Coach not found', { status: 404 });
    }

    return new NextResponse(JSON.stringify({ message: 'Coach deleted successfully' }), { status: 200 });
  } catch (error: any) {
    return new NextResponse('Error deleting coach: ' + error.message, { status: 500 });
  }
};