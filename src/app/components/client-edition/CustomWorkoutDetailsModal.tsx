'use client';

import { useState } from 'react';
import { UploadButton, UploadDropzone } from '../../../../lib/uploadthing';
import "@uploadthing/react/styles.css";


interface CustomWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    workoutName: string,
    workoutImg: string[],
    sets: number,
    reps: number,
    targetWeight?: string,
    comment?: string,
    workoutUrl?: string,
  ) => void;
}

const CustomWorkoutModal: React.FC<CustomWorkoutModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [workoutName, setWorkoutName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sets, setSets] = useState(0);
  const [reps, setReps] = useState(0);
  const [targetWeight, setTargetWeight] = useState('');
  const [comment, setComment] = useState('');
  const [workoutUrl, setWorkoutUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'done' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!workoutName || sets <= 0 || reps <= 0) {
      alert("Please fill out the required fields.");
      return;
    }

    const images = imageUrl ? [imageUrl] : [];

    onSubmit(
      workoutName,
      images,
      sets,
      reps,
      targetWeight || undefined,
      comment || undefined,
      workoutUrl || undefined
    );

    // Reset fields
    setWorkoutName('');
    setImageUrl('');
    setSets(0);
    setReps(0);
    setTargetWeight('');
    setComment('');
    setWorkoutUrl('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Create Custom Workout</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Workout Name *</label>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              required
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sets *</label>
            <input
              type="number"
              value={sets}
              onChange={(e) => setSets(Number(e.target.value))}
              required
              min={1}
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Reps *</label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              required
              min={1}
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Weight</label>
            <input
              type="text"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Video URL</label>
                <input
                type="text"
                value={workoutUrl}
                onChange={(e) => setWorkoutUrl(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2"
                />
            </div>
            <p className="text-xs text-gray-500 mt-1">
                Paste a link to a demo video (e.g. YouTube, TikTok, Instagram)
            </p>
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Workout Image</label>
                <UploadButton
                    endpoint="workoutImage"
                    appearance={{
                        button: "bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700",
                        container: "mt-2",
                    }}
                    onClientUploadComplete={(res) => {
                        if (res && res.length > 0) {
                            setImageUrl(res[0].url);
                        }
                    }}
                    onUploadError={(error: Error) => {
                        console.error("Upload failed", error);
                    }}
                />

                {uploadStatus === "done" && (
                    <>
                    <p className="text-green-600 text-sm mt-2">✅ Upload complete!</p>
                    <img src={imageUrl} alt="Workout preview" className="mt-2 h-24 object-cover rounded border" />
                    </>
                )}

                {uploadStatus === "error" && (
                    <p className="text-red-600 text-sm mt-2">❌ Something went wrong.</p>
                )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Save Workout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomWorkoutModal;
