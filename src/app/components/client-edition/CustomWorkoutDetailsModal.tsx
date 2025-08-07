'use client';

import { useState } from 'react';
import { Uploader } from '../ImageUploader';


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
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const [sets, setSets] = useState(0);
  const [reps, setReps] = useState(0);
  const [targetWeight, setTargetWeight] = useState('');
  const [comment, setComment] = useState('');
  const [workoutUrl, setWorkoutUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!workoutName || sets <= 0 || reps <= 0) {
      alert("Please fill out the required fields.");
      return;
    }

    const images = imageUrl.length > 0 ? imageUrl : [];

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
    setImageUrl([]);
    setSets(0);
    setReps(0);
    setTargetWeight('');
    setComment('');
    setWorkoutUrl('');
    onClose();
  };

  const handleCancel = async () => {
  try {
    // Only delete if image(s) exist
    if (imageUrl.length > 0) {
      await fetch('/api/imageHandling/delete-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: imageUrl }),
      });
    }
  } catch (err) {
    console.error('Error deleting uploaded images:', err);
  }

  // Reset fields and close modal
  setWorkoutName('');
  setImageUrl([]);
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
                <Uploader onUploadComplete={(urls) => setImageUrl(urls)} />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
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
