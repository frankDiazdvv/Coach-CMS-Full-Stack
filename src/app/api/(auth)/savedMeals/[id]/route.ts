import { NextRequest, NextResponse } from 'next/server';
import connect from '../../../../../../lib/db';
import SavedMeal from '../../../../../../lib/models/savedMeals';

// Extract ID from the request URL
function getIdFromRequest(request: NextRequest): string | null {
  const segments = request.nextUrl.pathname.split('/');
  return segments[segments.length - 1] || null;
}

export async function DELETE(req: NextRequest) {
  const id = getIdFromRequest(req);

  try {
    await connect();

    const Meal = await SavedMeal.findById(id);
    if (!Meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    // Delete from MongoDB
    await Meal.deleteOne();

    return NextResponse.json({ message: 'Meal deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
