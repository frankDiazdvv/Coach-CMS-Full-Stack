// src/app/api/(auth)/workoutLog/route.ts
import { NextResponse } from 'next/server';
import WorkoutLog from '../../../../../lib/models/workoutLogs';
import connect from '../../../../../lib/db';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Client from '../../../../../lib/models/clients'; // Import Client model to check coach

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Match this with your token signing key

export async function GET(req: Request) {
  await connect();

  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { id?: string, role?: string };
    if (decoded.role !== 'coach') {
      return NextResponse.json({ message: 'Unauthorized: Only coaches can view logs' }, { status: 403 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error. Invalid Token."
    return new NextResponse(message, { status: 401 });
  }

  try {
    const coachId = decoded.id;
    const clientIds = await Client.find({ coach: coachId }).distinct('_id');
    const logs = await WorkoutLog.find({ client: { $in: clientIds } })
      .populate('client', 'firstName lastName imageUrl')
      .sort({ loggedAt: -1 });
    return NextResponse.json(logs, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching logs"
    return new NextResponse(message, { status: 500 });
  }
}

export async function POST(req: Request) {
  await connect();

  const token = req.headers.get('authorization')?.split(' ')[1]; // Extract token from "Bearer <token>"
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { id?: string }; // Match the 'id' field from the token
    console.log('Decoded token:', decoded); // Debug the decoded payload
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }

  const { workoutSchedule, day, comment } = await req.json(); // Parse JSON body
  console.log('Request body:', { workoutSchedule, day, comment }); // Debug the request body

  // Validate required fields
  if (!workoutSchedule || !day) {
    return NextResponse.json({ message: 'workoutSchedule and day are required' }, { status: 400 });
  }

  // Ensure client is a valid ObjectId
  const clientId = decoded.id; // Use 'id' from the token
  if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) {
    return NextResponse.json({ message: 'Invalid or missing client ID' }, { status: 400 });
  }

  try {
    const log = new WorkoutLog({
      client: clientId,
      workoutSchedule,
      day,
      comment,
    });
    await log.save();
    return NextResponse.json({ message: 'Workout logged successfully', log }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error logging workout"
    return new NextResponse(message, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connect();

  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { id?: string, role?: string }; // Include role for coach check
    console.log('Decoded token:', decoded); // Debug the decoded payload
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }

  if (decoded.role !== 'coach') {
    return NextResponse.json({ message: 'Unauthorized: Only coaches can delete logs' }, { status: 403 });
  }

  const logId = params.id;
  if (!logId || !mongoose.Types.ObjectId.isValid(logId)) {
    return NextResponse.json({ message: 'Invalid log ID' }, { status: 400 });
  }

  try {
    const log = await WorkoutLog.findById(logId);
    if (!log) {
      return NextResponse.json({ message: 'Log not found' }, { status: 404 });
    }

    // Optionally, verify the coach is associated with the client's coach
    const client = await Client.findById(log.client);
    if (!client || !client.coach.equals(decoded.id)) {
      return NextResponse.json({ message: 'Unauthorized: Coach not associated with client' }, { status: 403 });
    }

    await WorkoutLog.findByIdAndDelete(logId);
    return NextResponse.json({ message: 'Log deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error deleting log"
    return new NextResponse(message, { status: 500 });
  }
}