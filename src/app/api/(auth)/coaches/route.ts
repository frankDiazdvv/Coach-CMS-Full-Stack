//HERE WE HAVE THE STATIC ROUTES FOR COACHES
import { NextResponse } from 'next/server';
import connect from '../../../../../lib/db';
import Coach, { ICoach } from '../../../../../lib/models/coach';

export const GET = async () => {
  try {
    await connect();
    const coaches = await Coach.find();
    return new NextResponse(JSON.stringify(coaches), { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error getting coaches";
    return new NextResponse(message, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    const body = await request.json() as Partial<ICoach>;
    if (!body.name || !body.email || !body.password || !body.phone) {
      return new NextResponse('Missing required fields', { status: 400 });
    }
    await connect();

    const newCoach = await Coach.create({
        ...body,
      }
    );
    return new NextResponse(JSON.stringify(newCoach), { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error deleting client";
    return new NextResponse(message, { status: 500 });
  }
};