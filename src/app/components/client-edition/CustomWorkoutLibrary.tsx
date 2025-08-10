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

  useEffect(() => {
  if (isOpen) {
    fetchWorkouts();
  }
}, [isOpen, coachId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;
    try {
      await fetch(`/api/savedWorkouts/${id}`, { method: 'DELETE' });
      setWorkouts((prev) => prev.filter((w) => w._id !== id));
      console.log("Workout Deleted Successfully!");

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
        <div className="absolute top-10 bottom-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Workout Library</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 hover:font-black cursor-pointer">
              ✕
            </button>
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : workouts.length === 0 ? (
            <p className="text-center text-gray-500">No saved workouts yet.</p>
          ) : (
            <ul className="absolute bottom-20 top-18 right-6 left-6 space-y-3 overflow-y-auto ">
              {workouts.map((workout) => (
                <li
                  key={workout._id}
                  className="flex items-center justify-between border p-0 rounded-md cursor-pointer hover:bg-gray-50"
                >
                  <div
                    className="flex items-center gap-3 flex-grow "
                    onClick={() => handleWorkoutSelect(workout.name, workout.imageUrl, workout.workoutUrl)}
                  >
                    <img
                      src={workout.imageUrl[0] || noWorkoutIcon}
                      alt={workout.name}
                      className="w-16 h-16 object-cover rounded-l-md"
                    />
                    <span className="font-medium">{workout.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering onSelect
                      handleDelete(workout._id);
                    }}
                    className="text-red-500 hover:text-red-700 rounded-md px-1 mx-1 hover:bg-red-50 hover:font-semibold cursor-pointer"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="absolute bottom-6 right-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center cursor-pointer gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl shadow-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
          onCreated={() => {
          setShowCreateModal(false);
          fetchWorkouts();
        }}
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
