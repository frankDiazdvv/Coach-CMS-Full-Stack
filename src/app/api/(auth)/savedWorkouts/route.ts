import { NextRequest, NextResponse } from 'next/server';
import connect from '../../../../../lib/db';
import SavedWorkout from '../../../../../lib/models/savedWorkouts';

export async function POST(req: NextRequest) {
  try {
    await connect();
    const body = await req.json();
    const { coachId, name, imageUrl, objectKey, workoutUrl } = body;

    if (!coachId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const workout = await SavedWorkout.create({
      coachId,
      name,
      imageUrl,
      objectKey,
      workoutUrl
    });

    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(req.url);
    const coachId = searchParams.get('coachId');

    if (!coachId) {
      return NextResponse.json({ error: 'coachId is required' }, { status: 400 });
    }

    const workouts = await SavedWorkout.find({ coachId }).sort({ createdAt: -1 });
    return NextResponse.json(workouts, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
