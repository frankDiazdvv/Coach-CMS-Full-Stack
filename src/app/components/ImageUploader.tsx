'use client';

import { useEffect, useState } from 'react';
import { useUploadFiles } from 'better-upload/client';
import { UploadDropzone } from '@/app/components/ui/upload-dropzone';

interface UploaderProps {
  onUploadComplete: (urls: string[]) => void;
}

export function Uploader({ onUploadComplete }: UploaderProps) {
  const { control, uploadedFiles, error } = useUploadFiles({ route: 'demo' });
  const [hasReportedUpload, setHasReportedUpload] = useState(false);

  useEffect(() => {
    if (uploadedFiles.length > 0 && !hasReportedUpload) {
      const urls = uploadedFiles.map((file) => {
        const bucketName = process.env.R2_BUCKET;
        const accountId = process.env.R2_ACCOUNT_ID;

        return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${file.objectKey}`;
      });

      console.log('✅ Upload successful:', urls);
      onUploadComplete(urls);
      setHasReportedUpload(true); // ✅ prevent future runs
    }
  }, [uploadedFiles, hasReportedUpload, onUploadComplete]);

  useEffect(() => {
    if (error) {
      console.error('❌ Upload error:', error);
    }
  }, [error]);

  return (
    <div>
      <UploadDropzone
        control={control}
        accept="image/*"
        description={{
          maxFiles: 4,
          maxFileSize: '5MB',
          fileTypes: 'JPEG, PNG, GIF',
        }}
      />
      {/* Optional: show upload results to user */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-sm mb-2">Uploaded Files:</h4>
          <ul className="text-sm list-disc list-inside">
            {uploadedFiles.map((file, idx) => (
              <li key={idx}>
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-500 text-sm">
          Upload failed: {error.message || 'An error occurred.'}
        </div>
      )}
    </div>
  );
}
