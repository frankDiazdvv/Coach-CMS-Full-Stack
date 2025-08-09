'use client';

import { useEffect, useState } from 'react';
import CustomWorkoutModal from './CustomWorkoutDetailsModal';
import WorkoutDetailsModal from './WorkoutDetailsModal';

interface Workout {
  _id: string;
  name: string;
  imageUrl: string[];
  sets: number,
  reps: number,
  targetWeight?: string,
  comment?: string,
  workoutUrl?: string;
}

interface WorkoutLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  coachId: string | null; // Pass this in from session/user context
  onSelect: (
    workoutName: string, 
    workoutImg: string[],
    sets: number,
    reps: number,
    targetWeight?: string,
    comment?: string,
    workoutUrl?: string,
  ) => void; // Callback to pass selected workout back
}

const WorkoutLibraryModal: React.FC<WorkoutLibraryModalProps> = ({ isOpen, onClose, coachId, onSelect }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [selectedWorkoutUrl, setSelectedWorkoutUrl] = useState<string | undefined>('');
  const [selectedWorkoutImg, setSelectedWorkoutImg] = useState<string[]>([]);

  // Fetch all saved workouts
  useEffect(() => {
    if (!isOpen) return;
    const fetchWorkouts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/savedWorkouts?coachId=${coachId}`);
        const data = await res.json();
        setWorkouts(data || []);
      } catch (err) {
        console.error('Error fetching workouts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [isOpen, coachId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;
    try {
      await fetch(`/api/savedWorkouts/${id}`, { method: 'DELETE' });
      setWorkouts((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      console.error('Error deleting workout:', err);
    }
  };

  const handleWorkoutSelect = (workoutName: string, workoutImages: string[], workoutUrl: string | undefined) => {
    setSelectedWorkout(workoutName); // Opens WorkoutDetailsModal
    setSelectedWorkoutImg(workoutImages);
    setSelectedWorkoutUrl(workoutUrl);
  };

  const handleWorkoutDetailsSubmit = (workoutImg: string[], sets: number, reps: number, targetWeight?: string, comment?: string, workoutUrl?: string) => {
    if (selectedWorkout) {
      onSelect(selectedWorkout, workoutImg, sets, reps, targetWeight, comment, workoutUrl);
    }
    setSelectedWorkout(null);
    setSelectedWorkoutImg([]);
    setSelectedWorkoutUrl('');
    onClose();
  };

  const noWorkoutIcon = '/no-image-icon.png';

  if (!isOpen) return null;

  return (
    <>
      {/* Main Library Modal */}
      <div className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-xs bg-black/40">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Workout Library</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : workouts.length === 0 ? (
            <p className="text-center text-gray-500">No saved workouts yet.</p>
          ) : (
            <ul className="space-y-3 max-h-60 overflow-y-auto">
              {workouts.map((workout) => (
                <li
                  key={workout._id}
                  className="flex items-center justify-between border p-2 rounded-md cursor-pointer"
                >
                  <div
                    className="flex items-center gap-3 flex-grow"
                    onClick={() => handleWorkoutSelect(workout.name, workout.imageUrl, workout.workoutUrl)}
                  >
                    <img
                      src={workout.imageUrl[0] || noWorkoutIcon}
                      alt={workout.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span className="font-medium">{workout.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering onSelect
                      handleDelete(workout._id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Create Workout
            </button>
          </div>
        </div>
      </div>

      {/* Create Workout Modal */}
      {showCreateModal && (
        <CustomWorkoutModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {selectedWorkout && (
        <WorkoutDetailsModal
            isOpen={!!selectedWorkout}
            workoutName={selectedWorkout}
            workoutImages={selectedWorkoutImg || []}
            workoutUrl={selectedWorkoutUrl}
            onClose={() => {
                setSelectedWorkout(null);
                setSelectedWorkoutImg([]);
                setSelectedWorkoutUrl('');
            }}
            onSubmit={handleWorkoutDetailsSubmit}
        />
        )}
    </>
  );
};

export default WorkoutLibraryModal;
