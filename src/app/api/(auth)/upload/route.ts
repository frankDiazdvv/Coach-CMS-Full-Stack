import { S3Client } from '@aws-sdk/client-s3';
import {
  createUploadRouteHandler,
  route,
  type Router,
} from 'better-upload/server';

const s3 = new S3Client({
  region: process.env.R2_REGION,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  endpoint: process.env.R2_ENDPOINT,
  forcePathStyle: true, // Required for Cloudflare R2
});

const router: Router = {
  client: s3,
  bucketName: process.env.NEXT_PUBLIC_R2_BUCKET!,
  routes: {
    demo: route({
      fileTypes: ['image/*'],
      multipleFiles: true,
      maxFiles: 4,
    }),
  },
};

export const { POST } = createUploadRouteHandler(router);