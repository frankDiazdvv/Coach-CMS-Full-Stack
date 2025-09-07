import { NextRequest, NextResponse } from 'next/server';
import connect from '../../../../../lib/db';
import SavedMeals from '../../../../../lib/models/savedMeals';

export async function POST(req: NextRequest) {
  try {
    await connect();
    const body = await req.json();
    const { coachId, mealName, foods } = body;

    if (!coachId || !mealName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const Meals = await SavedMeals.create({
      coachId,
      mealName,
      foods
    });

    return NextResponse.json(Meals, { status: 201 });
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

    const Meals = await SavedMeals.find({ coachId }).sort({ createdAt: -1 });
    return NextResponse.json(Meals, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}