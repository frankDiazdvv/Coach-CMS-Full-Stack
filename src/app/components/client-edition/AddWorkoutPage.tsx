'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AddWorkoutModal from './AddWorkoutModal';
import WorkoutCard from './WorkoutCard';
import ViewExerciseDetails from './ViewExerciseDetailsModal';
import { useTranslations } from 'next-intl';

interface IWorkout {
  name: string;
  sets: number;
  reps: number;
  targetWeight?: string;
  comment?: string;
  workoutUrl?: string;
}

interface WorkoutDay {
  weekDay: string;
  workouts: IWorkout[];
}

const AddWorkoutPage: React.FC = () => {
  const t = useTranslations();
  const tWeekday = useTranslations('weekdays');
  const router = useRouter();
  const [schedule, setSchedule] = useState<WorkoutDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<{
    day: string;
    index: number;
    workout: IWorkout;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false); // Mode flag
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');


  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];


  // Load or fetch schedule based on mode
  useEffect(() => {
    // Fetch workout schedule from the database
    const workoutScheduleId = localStorage.getItem('workoutScheduleId');
    const clientFirstName = localStorage.getItem('userFirstName');
    const clientLastName = localStorage.getItem('userLastName');   
    
    setFirstName(clientFirstName || '');
    setLastName(clientLastName || '');

    if (workoutScheduleId) {
      setIsEditing(true);
      fetchWorkoutSchedule(workoutScheduleId);
    } else {
      // If not created, load schedule from local storage(meaning we are creating a new user in the addClientModal)
      const storedSchedule = localStorage.getItem('workoutSchedule');
      if (storedSchedule) {
        setSchedule(JSON.parse(storedSchedule));
      }
      setLoading(false);
    }
  }, []);

  const fetchWorkoutSchedule = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`/api/workoutSchedule/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch workout schedule');

      const data = await response.json();
      setSchedule(data.schedule || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error fetching workout schedule";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkout = (day: string) => {
    setSelectedDay(day);
  };

  const handleSelectWorkout = (workoutName: string, workoutReps: number, workoutSets: number, targetWeight?: string, workoutComment?: string, workoutUrl?: string) => {
    if (selectedDay) {
      setSchedule((prev) => {
        const existingDay = prev.find((d) => d.weekDay === selectedDay);
        const newWorkout: IWorkout = {
          name: workoutName,
          reps: workoutReps,
          sets: workoutSets,
          targetWeight: targetWeight,
          comment: workoutComment || 'No Comment',
          workoutUrl: workoutUrl || '',
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

  const handleConfirmWorkout = async () => {
    if (isEditing) {
      const workoutScheduleId = localStorage.getItem('workoutScheduleId');
      if (!workoutScheduleId) {
        setError('No workout schedule ID found');
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token');

        const response = await fetch(`/api/workoutSchedule/${workoutScheduleId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ schedule }),
        });

        if (!response.ok) throw new Error('Failed to update workout schedule');

        localStorage.removeItem('workoutScheduleId');
        router.push(`/coach/all-clients`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t("genericError");
        setError(message);
      } finally {
        setLoading(false);
      }
    } else {
      localStorage.setItem('workoutSchedule', JSON.stringify(schedule));
      localStorage.setItem('openModalAfterWorkout', 'true');
      router.push(`/coach/coach-dashboard`); // Redirect back to AddClientModal
    }
  };

  const handleCancelCreation = () => {
    if(isEditing){
      localStorage.removeItem('workoutScheduleId');
      router.push(`/coach/all-clients`);
    } else {
      localStorage.removeItem('workoutSchedule');
      localStorage.setItem('openModalAfterWorkout', 'true');
      router.push(`/coach/coach-dashboard`);
    }
  };

  const getCurrentDate = () => {
    const currentDate = new Date();
    return currentDate.toLocaleString(t("locale"), {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
    <div className="fixed z-200 left-0 right-0 min-h-screen bg-gray-100 p-6">
      {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className='flex gap-2'>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {isEditing ? t('editWorkoutSchedule') : t('buildWorkoutSchedule')}
              </h1>
              <p className="flex items-center text-sm text-gray-500"> - {getCurrentDate()}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancelCreation}
                disabled={loading}
                className="inline-flex items-center cursor-pointer gap-2 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-medium rounded-xl shadow-md hover:from-gray-500 hover:to-gray-600 transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t('loading')}
                  </>
                ) : (
                  <>
                    {t('cancel')}
                  </>
                )}
              </button>
              <button
                onClick={handleConfirmWorkout}
                disabled={loading}
                className="inline-flex items-center cursor-pointer gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl shadow-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isEditing ? t('saveChanges') : t('confirmWorkout')}
                  </>
                )}
              </button>
            </div>
          </div>
          {isEditing && firstName && lastName && (
            <div className="">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {t('client')}: {firstName} {lastName}
              </span>
            </div>
          )}
        </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="fixed bottom-4 right-4 left-4 top-30 bg-white rounded-lg shadow-lg pt-4">
        <div className="grid grid-cols-7 gap-0 h-full">
          {daysOfWeek.map((day) => (
            <div key={day} className="flex flex-col items-center h-full overflow-y-auto">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">{tWeekday(day)}</h2>
              <div className="flex-1 flex-col p-2 gap-1 w-full border-x border-slate-200 overflow-y-auto justify-center">
                 <button
                  onClick={() => handleAddWorkout(day)}
                  className="w-full mb-4 p-2 cursor-pointer border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                      {t('addWorkout')}
                    </span>
                  </div>
                </button>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : schedule.length > 0 && schedule.find((d) => d.weekDay === day)
                  ?.workouts.map((workout, index) => (
                    <WorkoutCard
                      key={index}
                      name={workout.name}
                      sets={workout.sets}
                      reps={workout.reps}
                      targetWeight={workout.targetWeight}
                      comment={workout.comment}
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