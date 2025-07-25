'use client';

import { useState } from 'react';

interface ViewExerciseDetailsProps {
  isOpen: boolean;
  workout: {
    name: string;
    workoutImages: string[];
    sets: number;
    reps: number;
    targetWeight?: string;
    comment?: string;
    workoutUrl?: string;
  };
  onClose: () => void;
  onSave: (updatedWorkout: {
    name: string;
    workoutImages: string[];
    sets: number;
    reps: number;
    targetWeight?: string;
    comment?: string;
    workoutUrl?: string;
  }) => void;
  onDelete: () => void;
}

const ViewExerciseDetails: React.FC<ViewExerciseDetailsProps> = ({ isOpen, workout, onClose, onSave, onDelete }) => {
  const [sets, setSets] = useState<number>(workout.sets);
  const [reps, setReps] = useState<number>(workout.reps);
  const [targetWeight, setTargetWeight] = useState<string | undefined>(workout.targetWeight);
  const [comment, setComment] = useState<string | undefined>(workout.comment);
  const [workoutUrl, setWorkoutUrl] = useState<string | undefined>(workout.workoutUrl);

  const noWorkoutIcon = '/no-image-icon.png';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: workout.name,
      workoutImages: workout.workoutImages,
      sets,
      reps,
      targetWeight: targetWeight || undefined,
      comment: comment || undefined,
      workoutUrl: workoutUrl || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-800">
          Details of {workout.name}
        </h2>
        <div className="mb-4 flex flex-row overflow-x-auto gap-2">
          {workout.workoutImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Workout image ${index + 1}`}
              className="h-24 min-w-15 w-auto rounded border border-gray-200"
            />
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sets</label>
            <input
              type="number"
              value={sets}
              onChange={(e) => setSets(Number(e.target.value))}
              required
              min="1"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Reps</label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              required
              min="1"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Weight</label>
            <input
              type="text"
              value={targetWeight || ''}
              onChange={(e) => setTargetWeight(e.target.value)}
              placeholder="e.g., 135 lbs"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Comment</label>
            <textarea
              value={comment || ''}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g., Focus on form"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Video URL</label>
            <input
              type="text"
              value={workoutUrl || ''}
              onChange={(e) => setWorkoutUrl(e.target.value)}
              placeholder="Any video link"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onDelete}
              className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Delete
            </button>
            <div className="flex space-x-2">
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
                Accept
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ViewExerciseDetails;