import { NextResponse } from 'next/server';
import WorkoutLog from '../../../../../../lib/models/workoutLogs';
import connect from '../../../../../../lib/db';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connect();

  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { id?: string };
    if (!decoded.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
  }

  const clientId = params.id || decoded.id; // Use params.id if provided, else decoded.id
  if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) {
    return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
  }

  try {
    const logs = await WorkoutLog.find({ client: clientId }).sort({ loggedAt: -1 });
    return NextResponse.json(logs, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching client logs:', error);
    return NextResponse.json({ message: 'Error fetching client logs', error: error.message }, { status: 500 });
  }
}