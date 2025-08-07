import { NextRequest, NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `${process.env.R2_ENDPOINT}`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  const { urls } = await req.json();

  try {
    for (const url of urls) {
      const key = new URL(url).pathname.replace(/^\/?[^\/]+\/?/, ''); // remove bucket name
      await r2.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET!,
          Key: key,
        })
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting files from R2:', error);
    return new NextResponse('Failed to delete image(s)', { status: 500 });
  }
}
