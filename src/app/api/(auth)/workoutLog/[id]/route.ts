import { NextRequest, NextResponse } from 'next/server';
import WorkoutLog from '../../../../../../lib/models/workoutLogs';
import connect from '../../../../../../lib/db';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper to extract ID from request URL
function getIdFromRequest(request: NextRequest): string | null {
  const segments = request.nextUrl.pathname.split('/');
  // Assuming URL is like /api/(auth)/logs/[id]
  return segments[segments.length - 1] || null;
}

// GET: Fetch workout logs by client ID (from params or token)
export async function GET(request: NextRequest) {
  try {
    await connect();

    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return new NextResponse('Unauthorized: No token provided', { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id?: string };
      if (!decoded.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
        return new NextResponse('Invalid token: No valid ID', { status: 400 });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unauthorized. Invalid Token';
      return new NextResponse(message, { status: 401 });
    }

    const clientId = getIdFromRequest(request) || decoded.id;
    if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) {
      return new NextResponse('Invalid client ID', { status: 400 });
    }

    const logs = await WorkoutLog.find({ client: clientId }).sort({ loggedAt: -1 });
    return NextResponse.json(logs, { status: 200 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching workout logs';
    return new NextResponse(message, { status: 500 });
  }
}
