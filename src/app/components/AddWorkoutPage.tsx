
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AddWorkoutModal from './AddWorkoutModal';
import WorkoutCard from './WorkoutCard';
import ViewExerciseDetails from './ViewExerciseDetailsModal';

interface IWorkout {
  name: string;
  sets: number;
  reps: number;
  targetWeight?: string;
  comment?: string;
  imageUrl?: string;
}

interface WorkoutDay {
  weekDay: string;
  workouts: IWorkout[];
}

const AddWorkoutPage: React.FC = () => {
  const router = useRouter();
  const [schedule, setSchedule] = useState<WorkoutDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<{
    day: string;
    index: number;
    workout: IWorkout;
  } | null>(null);

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];


  // Load existing schedule from localStorage on mount
  useEffect(() => {
    const storedSchedule = localStorage.getItem('workoutSchedule');
    if (storedSchedule) {
      setSchedule(JSON.parse(storedSchedule));
    }
  }, []);

  const handleAddWorkout = (day: string) => {
    setSelectedDay(day);
  };

  const handleSelectWorkout = (workoutName: string, workoutReps: number, workoutSets: number, targetWeight?: string, workoutComment?: string) => {
    if (selectedDay) {
      setSchedule((prev) => {
        const existingDay = prev.find((d) => d.weekDay === selectedDay);
        const newWorkout: IWorkout = {
          name: workoutName,
          reps: workoutReps,
          sets: workoutSets,
          targetWeight: targetWeight,
          comment: workoutComment || 'No Comment',
        };
        if (existingDay) {
          return prev.map((d) =>
            d.weekDay === selectedDay
              ? { ...d, workouts: [...d.workouts, newWorkout] }
              : d
          );
        }
        return [...prev, { weekDay: selectedDay, workouts: [newWorkout] }];
      });
    }
  };

  const handleConfirmWorkout = () => {
    // Redirect back to coach-dashboard and open modal with the workout schedule
    localStorage.setItem('workoutSchedule', JSON.stringify(schedule));
    localStorage.setItem('openModalAfterWorkout', 'true');
    router.push(`/client-side/coach-dashboard`);
  };

  const handleOpenDetails = (day: string, index: number, workout: IWorkout) => {
    setSelectedWorkout({ day, index, workout });
  };

  const handleSaveWorkout = (updatedWorkout: IWorkout) => {
    if (selectedWorkout) {
      setSchedule((prev) =>
        prev.map((d) =>
          d.weekDay === selectedWorkout.day
            ? {
                ...d,
                workouts: d.workouts.map((w, i) =>
                  i === selectedWorkout.index ? updatedWorkout : w
                ),
              }
            : d
        )
      );
    }
  };

  const handleDeleteWorkout = () => {
    if (selectedWorkout) {
      setSchedule((prev) =>
        prev.map((d) =>
          d.weekDay === selectedWorkout.day
            ? {
                ...d,
                workouts: d.workouts.filter((_, i) => i !== selectedWorkout.index),
              }
            : d
        )
      );
      setSelectedWorkout(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Build Workout Schedule
        </h1>
        <button
          onClick={handleConfirmWorkout}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Confirm Workout
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="grid grid-cols-7 gap-4">
          {daysOfWeek.map((day) => (
            <div key={day} className="flex flex-col items-center">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">{day}</h2>
              <div className="flex flex-col gap-1 w-full h-64 border border-gray-300 rounded-md items-center justify-center bg-gray-50">
                <button
                  onClick={() => handleAddWorkout(day)}
                  className="text-2xl text-blue-500 hover:text-blue-700 mb-2"
                >
                  +
                </button>
                {/* Display added workouts for the day */}
                {schedule.find((d) => d.weekDay === day)
                  ?.workouts.map((workout, index) => (
                    <WorkoutCard
                      key={index}
                      name={workout.name}
                      sets={workout.sets}
                      reps={workout.reps}
                      targetWeight={workout.targetWeight}
                      imageUrl={workout.imageUrl}
                      onClick={() => handleOpenDetails(day,index, workout)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Modal for adding workouts */}
      <AddWorkoutModal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        onSelectWorkout={handleSelectWorkout}
      />
      {selectedWorkout && (
        <ViewExerciseDetails
          isOpen={!!selectedWorkout}
          workout={selectedWorkout.workout}
          onClose={() => setSelectedWorkout(null)}
          onSave={handleSaveWorkout}
          onDelete={handleDeleteWorkout}
        />
      )}
    </div>
  );
};

export default AddWorkoutPage;