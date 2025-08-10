import { NextRequest, NextResponse } from 'next/server';
import connect from '../../../../../../lib/db';
import SavedWorkout from '../../../../../../lib/models/savedWorkouts';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `${process.env.R2_ENDPOINT}`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Extract ID from the request URL
function getIdFromRequest(request: NextRequest): string | null {
  const segments = request.nextUrl.pathname.split('/');
  return segments[segments.length - 1] || null;
}

export async function DELETE(req: NextRequest) {
  const id = getIdFromRequest(req);

  try {
    await connect();

    const workout = await SavedWorkout.findById(id);
    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Delete from Cloudflare R2
    await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_R2_BUCKET!,
        Key: workout.objectKey,
      })
    );

    // Delete from MongoDB
    await workout.deleteOne();

    return NextResponse.json({ message: 'Workout deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
