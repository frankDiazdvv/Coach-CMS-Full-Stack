'use client';

import { useState, useEffect } from 'react';

interface Workout {
  id: number;
  name: string;
}

interface AddWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkout: (workout: string) => void;
}

const AddWorkoutModal: React.FC<AddWorkoutModalProps> = ({ isOpen, onClose, onSelectWorkout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch workouts from API when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchWorkouts = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('https://wger.de/api/v2/exerciseinfo/?language=2&limit=2000');
            if (!response.ok) throw new Error('Failed to fetch workouts');
            const data = await response.json();

            console.log(data.results[0]);

            const workoutList = data.results
            .map((w: any) => {
                const englishTranslation = w.translations.find((t: any) => t.language === 2);
                    console.log('Workout:', w.id, 'Translation:', englishTranslation?.name);
                return englishTranslation ? { id: w.id, name: englishTranslation.name } : null;
            }).filter((w: any) => w && w.name && w.name.trim() !== '');

            setWorkouts(workoutList);
            setFilteredWorkouts(workoutList);

        } catch (err: any) {
          setError(err.message || 'Failed to load workouts');
        } finally {
          setIsLoading(false);
        }
      };

      fetchWorkouts();
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  return (
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
                onClick={() => {
                  onSelectWorkout(workout.name);
                  onClose();
                }}  
                className="cursor-pointer rounded-md p-2 hover:bg-gray-100"
              >
                {workout.name.toUpperCase()}
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
  );
};

export default AddWorkoutModal;