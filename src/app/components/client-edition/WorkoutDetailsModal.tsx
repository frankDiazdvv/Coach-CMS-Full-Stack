'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Link from 'next/link';

interface WorkoutDetailsModalProps {
  isOpen: boolean;
  workoutName: string;
  workoutImages: string[];
  workoutUrl?: string;
  onClose: () => void;
  onSubmit: (
    workoutImg: string[],
    sets: number,
    reps: number,
    targetWeight?: string,
    comment?: string,
    workoutUrl?: string,
  ) => void;
}

const WorkoutDetailsModal: React.FC<WorkoutDetailsModalProps> = ({ isOpen, workoutName, workoutImages, workoutUrl, onClose, onSubmit }) => {
  const t = useTranslations();
  const [sets, setSets] = useState<number>(0);
  const [reps, setReps] = useState<number>(0);
  const [targetWeight, setTargetWeight] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [workoutLink, setWorkoutLink] = useState<string | undefined>(workoutUrl);
  const [workoutImg, setWorkoutimg] = useState<string[]>(workoutImages);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(workoutImg, sets, reps, targetWeight || undefined, comment || undefined, workoutLink || undefined);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/20 backdrop-blur-md">
      <div className="w-full max-w-md rounded-lg bg-white px-6 py-4 shadow-lg">
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">
          {t("detailsFor")} {workoutName}
        </h2>
        <div className="mb-4 flex flex-row overflow-x-auto gap-2">
          {workoutImg.map((img, index) => (
            <Link key={index} href={img} target='_blank'>
              <img
                key={index}
                src={img}
                alt={`Workout image ${index + 1}`}
                className="h-24 w-auto rounded border border-gray-200"
              />
            </Link>
            
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t("sets")}</label>
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
            <label className="block text-sm font-medium text-gray-700">{t("reps")}</label>
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
            <label className="block text-sm font-medium text-gray-700">{t("targetWeight")}</label>
            <input
              type="text"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              placeholder={t("targetWeightPlaceholder")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t("comment")}</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("commentPlaceholder")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t("demonstrationUrl")}:</label>
            <input
              type="text"
              value={workoutUrl}
              onChange={(e) => setWorkoutLink(e.target.value)}
              placeholder={t("videoLinkPlaceholder")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              onClick={() => {
                setWorkoutimg(workoutImages);
              }}
            >
              {t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkoutDetailsModal;