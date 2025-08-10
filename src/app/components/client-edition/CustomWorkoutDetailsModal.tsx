'use client';

import { useEffect, useState } from 'react';
import { Uploader } from '../ImageUploader';


interface CustomWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CustomWorkoutModal: React.FC<CustomWorkoutModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [workoutName, setWorkoutName] = useState('');
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const [workoutUrl, setWorkoutUrl] = useState('');

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const coachId = localStorage.getItem('id');
  if(!coachId) throw new Error("No Coach Id");

  if (!workoutName) {
    alert("Please fill out the required fields.");
    return;
  }

  try {
    // Extract the first image URL & object key if needed
    const image = imageUrl.length > 0 ? imageUrl[0] : undefined;

    const res = await fetch('/api/savedWorkouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coachId,
        name: workoutName,
        imageUrl: image,
        objectKey: image ? new URL(image).pathname.slice(1) : undefined, // Example objectKey
        workoutUrl: workoutUrl
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to save workout');
    }

    const savedWorkout = await res.json();
    console.log("Workout saved:", savedWorkout);

    // Reset form
    setWorkoutName('');
    setImageUrl([]);
    setWorkoutUrl('');
    onCreated();
    onClose();

  } catch (error) {
    console.error("Error saving workout:", error);
    alert("There was an error saving the workout.");
  }
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
  setWorkoutUrl('');
  onClose();
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 backdrop-blur-sm">
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
