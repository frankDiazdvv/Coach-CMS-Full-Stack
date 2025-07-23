'use client';

import { useState, useEffect } from 'react';
import WorkoutDetailsModal from './WorkoutDetailsModal';
import { useLocale } from 'next-intl';

interface Workout {
  id: number;
  name: string;
  description: string;
  images: string[];
}

interface AddWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkout: (
    workoutName: string, 
    sets: number,
    reps: number,
    targetWeight?: string,
    comment?: string,
    workoutUrl?: string,
  ) => void;
}

const AddWorkoutModal: React.FC<AddWorkoutModalProps> = ({ isOpen, onClose, onSelectWorkout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const locale = useLocale();

  // Fetch workouts from API when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchWorkouts = async () => {
        setIsLoading(true);
        setError('');

        const languageId = locale === 'es' ? 4 : 2;


        try {
            const response = await fetch(`https://wger.de/api/v2/exerciseinfo/?language=${languageId}&limit=2000`);
            if (!response.ok) throw new Error('Failed to fetch workouts');
            const data = await response.json();

            // Map exercises with name, description, and fetch images
            const workoutListPromises = data.results.map(async (w: any) => {
              const translation = w.translations.find((t: any) => t.language === languageId);

              // Fetch images for this exercise
              let images: string[] = [];
              try {
                const imageResponse = await fetch(`https://wger.de/api/v2/exerciseimage/?exercise=${w.id}`);
                if (imageResponse.ok) {
                  const imageData = await imageResponse.json();
                  images = imageData.results.map((img: any) => img.image);
                }
              } catch (imgError) {
                console.warn(`No images found for exercise ${w.id}`);
              }

              return translation && translation.name && translation.name.trim() !== ''
                ? {
                    id: w.id,
                    name: translation.name,
                    description: translation.description || 'No description available',
                    images,
                  }
                : null;
            });

            // Resolve all promises to get the workout list
            const workoutList = (await Promise.all(workoutListPromises)).filter(
              (w: any) => w !== null
            );

            setWorkouts(workoutList);
            setFilteredWorkouts(workoutList);

        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Failed to Load Workouts";
          setError(message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchWorkouts();
    }
  }, [isOpen, locale]);

  // Filter workouts based on search query
  useEffect(() => {
    setFilteredWorkouts(
      workouts.filter(
    (workout) =>
      workout.name &&
      workout.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
    );
  }, [searchQuery, workouts]);

  const handleWorkoutSelect = (workoutName: string) => {
    setSelectedWorkout(workoutName); // Open WorkoutDetailsModal
  };

  const handleWorkoutDetailsSubmit = (sets: number, reps: number, targetWeight?: string, comment?: string, workoutUrl?: string) => {
    if (selectedWorkout) {
      onSelectWorkout(selectedWorkout, sets, reps, targetWeight, comment, workoutUrl);
    }
    setSelectedWorkout(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Add Workout</h2>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search workouts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />

          {/* Scrollable Workout List */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : filteredWorkouts.length === 0 ? (
              <p className="text-gray-500">No workouts found</p>
            ) : (
              filteredWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  onClick={() => handleWorkoutSelect(workout.name)}
                  className="flex items-center gap-4 cursor-pointer rounded-md p-2 hover:bg-gray-100 transition"
                >
                  <img
                    src={workout.images[0]}
                    alt=''
                    className="w-14 h-14 object-cover rounded-md bg-gray-200"
                  />
                  <h3 className="text-base font-medium text-gray-800">{workout.name}</h3>
                </div>
              ))
            )}
          </div>

          {/* Close Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      {selectedWorkout && (
          <WorkoutDetailsModal
            isOpen={!!selectedWorkout}
            workoutName={selectedWorkout}
            onClose={() => setSelectedWorkout(null)}
            onSubmit={handleWorkoutDetailsSubmit}
          />
        )}
      </>
  );
};

export default AddWorkoutModal;