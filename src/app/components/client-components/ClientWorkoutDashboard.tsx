'use client';

import { useState, useEffect } from 'react';
import { IWorkoutSchedule, IDailyWorkout } from '../../../../lib/models/workouts';
import { useFormatter, useTranslations } from 'use-intl';
import Link from 'next/link';

const ClientWorkoutDashboard: React.FC = () => {
  const t = useTranslations();
  const format = useFormatter();
  const [clientSchedule, setClientSchedule] = useState<IWorkoutSchedule | null>(null);
  const [clientName, setClientName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<IDailyWorkout | null>(null);
  const [dueToday, setDueToday] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [loggedWorkouts, setLoggedWorkouts] = useState<{ [key: string]: { logged: boolean; date: string } }>({}); // Track by weekday and date
  const [message, setMessage] = useState<string | null>(null);
  const [comment, setComment] = useState<string>(''); // Optional comment
  const [fullSchedule, setFullSchedule] = useState(false);

  // Helper function to get a unique key for the day
  const getLogKey = (weekday: string, date: Date) => `${weekday}_${date.toISOString().split('T')[0]}`;

  useEffect(() => {
    const id = localStorage.getItem('id');
    if (id) {
      const saved = localStorage.getItem(`loggedWorkouts_${id}`);
      // console.log(`logged workout saved - ${saved}`);
      setLoggedWorkouts(saved ? JSON.parse(saved) : {});
    }
    setClientName(localStorage.getItem('name') || 'User');
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      const id = localStorage.getItem('id');
      if (!id) {
        setError('No client ID in localStorage');
        setIsLoading(false);
        return;
      }

      try {
        await fetchData();
      } catch (err) {
        console.error('Invalid client ID or fetch error:', err);
        setError('Invalid client ID or failed to fetch data');
        setIsLoading(false);
      }
    };
    initializeData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const workoutScheduleId = localStorage.getItem('workoutScheduleId');
    if (!token || !workoutScheduleId) {
      setError('No token or workout schedule ID found');
      setIsLoading(false);
      return;
    }
    // console.log('Token used:', token); // Debug the token

    try {
      const response = await fetch(`/api/workoutSchedule/${workoutScheduleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || 'Failed to fetch workout schedule');
      }

      const data = await response.json();
      // console.log('Fetched data:', data);

      setClientSchedule(data);
      const todayWeekday = today.toLocaleDateString('en-US', { weekday: 'long' });
      setDueToday(!!data.schedule.find((day: { weekDay: string; workouts: string | any[]; }) => day.weekDay === todayWeekday && day.workouts.length > 0));

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("genericError");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date() // Set to a specific date for testing
  today.setHours(0, 0, 0, 0);
  // console.log('Today:', today);

  const handleDayClick = (day: IDailyWorkout) => {
    setSelectedDay(day);
  };

  const handleCloseModal = () => {
    setSelectedDay(null);
    setComment(''); // Reset comment
  };

  const handleLogWorkout = (day: IDailyWorkout) => {
    setLogModalOpen(true);
  };

  const handleLogComplete = async (day: IDailyWorkout) => {
    const token = localStorage.getItem('token');
    const workoutScheduleId = localStorage.getItem('workoutScheduleId');
    const clientId = localStorage.getItem('id');
    localStorage.removeItem(`loggedWorkouts_${clientId}`);

    if (token && workoutScheduleId && clientId) {
      try {
        const logKey = getLogKey(day.weekDay, today);
        if (loggedWorkouts[logKey]?.logged) {
          setMessage(t('workoutAlreadyLogged'));
          setTimeout(() => setMessage(null), 10000);
          return;
        }

        // console.log('Sending log request:', { client: clientId, workoutSchedule: workoutScheduleId, day: day.weekDay, comment });
        const response = await fetch('/api/workoutLog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            client: clientId,
            workoutSchedule: workoutScheduleId,
            day: day.weekDay,
            comment: comment || undefined, // Send undefined if empty
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to log workout');
        }

        const updated = {
          [logKey]: { logged: true, date: today.toISOString().split('T')[0] },
        };
        
        setLoggedWorkouts(updated);
        console.log('Updated loggedWorkouts:', updated);
        localStorage.setItem(`loggedWorkouts_${clientId}`, JSON.stringify(updated));
        setMessage(t('workoutLoggedSuccessfully'));
        setTimeout(() => setMessage(null), 15000);
      } catch (error) {
        console.error('Error logging workout:', error);
        setMessage(t('workoutLogFailed'));
        setTimeout(() => setMessage(null), 10000);
      }
    }
    setLogModalOpen(false);
    setComment(''); // Reset comment after logging
  };
  const weekdayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const sortedSchedule = clientSchedule?.schedule.sort((a, b) => {
    return weekdayOrder.indexOf(a.weekDay) - weekdayOrder.indexOf(b.weekDay);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <p className="text-red-600 text-lg font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 pt-24 mb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('greeting')}, <span className="text-blue-600">{clientName}</span>
          </h1>
          <p className="text-gray-600">{t('readyToTrain')}</p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-6 bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-4 rounded-2xl shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-3">
                <p className="font-semibold">{t('success')}!</p>
                <p className="text-green-100">{message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Today's Workout Hero Section */}
        <div className="mb-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="text-2xl mr-3">🏋️</span>
                {t('todaysWorkout')}
              </h2>
              <p className="text-blue-100 mt-1">
                {today.toLocaleDateString(t("locale"), { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            <div className="p-6">
              {sortedSchedule?.find((day) => day.weekDay === today.toLocaleDateString('en-US', { weekday: 'long' }))?.workouts.length ? (
                <div className="space-y-4">
                  {sortedSchedule
                    .find((day) => day.weekDay === today.toLocaleDateString('en-US', { weekday: 'long' }))
                    ?.workouts.map((workout, index) => (
                      <div
                        key={index}
                        className={`relative overflow-hidden rounded-2xl p-5 border-2 transition-all duration-300 ${
                          loggedWorkouts[getLogKey(today.toLocaleDateString('en-US', { weekday: 'long' }), today)]?.logged 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg transform scale-[1.02]' 
                            : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        {loggedWorkouts[getLogKey(today.toLocaleDateString('en-US', { weekday: 'long' }), today)]?.logged && (
                          <div className="absolute top-3 right-3">
                            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                              <span className="text-sm font-bold">✓</span>
                            </div>
                          </div>
                        )}
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{workout.name}</h3>
                        {workout.workoutImages && workout.workoutImages.length > 0 && (
                        <div className="mt-3 overflow-x-auto">
                          <div className="flex gap-3 p-2 rounded-xl bg-gray-100" style={{ minHeight: '120px' }}>
                          {workout.workoutImages.map((image: string, imgIndex: number) => (
                            <img
                            key={imgIndex}
                            src={image}
                            alt={`Workout Image ${imgIndex + 1}`}
                            className="w-auto h-28 rounded-lg object-contain flex-shrink-0"
                            />
                          ))}
                          </div>
                        </div>
                      )}
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <div className="text-center">
                            <p className="text-sm text-gray-500 font-medium">{t('sets')}</p>
                            <p className="text-2xl font-bold text-blue-600">{workout.sets}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500 font-medium">{t('reps')}</p>
                            <p className="text-2xl font-bold text-purple-600">{workout.reps}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500 font-medium">{t('weight')}</p>
                            <p className="text-2xl font-bold text-indigo-600">{workout.targetWeight || '—'}</p>
                          </div>
                        </div>
                        {workout.comment !== 'No Comment' && (
                          <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-600 italic">{workout.comment}</p>
                          </div>
                        )}
                        {workout.workoutUrl && (           
                          <Link
                            href={workout.workoutUrl}
                            target="_blank"
                            className="mt-4 w-full inline-flex items-center justify-center px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:from-blue-600 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            <span className="mr-2">▶️</span>
                            Video Tutorial
                          </Link>
                        )}
                      </div>
                    ))}
                  
                  <button
                    onClick={() => {
                      const day = clientSchedule?.schedule.find(
                        (day) => day.weekDay === today.toLocaleDateString('en-US', { weekday: 'long' })
                      );
                      if (day) {
                        setDueToday(true);
                        handleDayClick(day);
                      }
                    }}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                      loggedWorkouts[getLogKey(today.toLocaleDateString('en-US', { weekday: 'long' }), today)]?.logged
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                    }`}
                    disabled={loggedWorkouts[getLogKey(today.toLocaleDateString('en-US', { weekday: 'long' }), today)]?.logged}
                  >
                    {loggedWorkouts[getLogKey(today.toLocaleDateString('en-US', { weekday: 'long' }), today)]?.logged 
                      ? t('workoutCompleted') 
                      : t('logWorkout')
                    }
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">😴</span>
                  </div>
                  <p className="text-xl text-gray-600 font-medium">{t('restDay')}</p>
                  <p className="text-gray-500 mt-2">{t('enjoyYourRestDay')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full Schedule Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setFullSchedule(!fullSchedule)}
            className="w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📅</span>
                <span className="text-lg font-semibold text-gray-900">
                  {fullSchedule ? t('hideFullSchedule') : t('viewFullSchedule')}
                </span>
              </div>
              <div className={`transform transition-transform duration-300 ${fullSchedule ? 'rotate-180' : ''}`}>
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Full Schedule */}
        {fullSchedule && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('weeklySchedule')}</h3>
            {sortedSchedule?.map((daySchedule, dayIndex) => (
              <div key={daySchedule.weekDay} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4">
                  <h4 className="text-xl font-bold text-white">{daySchedule.weekDay}</h4>
                </div>
                
                <div className="p-6">
                  {daySchedule.workouts.length > 0 ? (
                    <div className="space-y-4">
                      {daySchedule.workouts.map((workout, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-5 border border-gray-200 hover:shadow-md transition-all duration-300"
                        >
                          <h5 className="text-lg font-bold text-gray-900 mb-3">{workout.name}</h5>
                          {workout.workoutImages && workout.workoutImages.length > 0 && (
                            <div className="mt-3 overflow-x-auto">
                              <div className="flex gap-3 p-2 rounded-xl bg-gray-100" style={{ minHeight: '120px' }}>
                              {workout.workoutImages.map((image: string, imgIndex: number) => (
                                <img
                                key={imgIndex}
                                src={image}
                                alt={`Workout Image ${imgIndex + 1}`}
                                className="w-auto h-28 rounded-lg object-contain flex-shrink-0"
                                />
                              ))}
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-3 gap-4 mt-2">
                            <div className="text-center">
                              <p className="text-sm text-gray-500 font-medium">{t('sets')}</p>
                              <p className="text-xl font-bold text-blue-600">{workout.sets}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500 font-medium">{t('reps')}</p>
                              <p className="text-xl font-bold text-purple-600">{workout.reps}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500 font-medium">{t('weight')}</p>
                              <p className="text-xl font-bold text-indigo-600">{workout.targetWeight || '—'}</p>
                            </div>
                          </div>
                          {workout.comment !== 'No Comment' && (
                            <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200">
                              <p className="text-sm text-gray-600 italic">{workout.comment}</p>
                            </div>
                          )}
                          {workout.workoutUrl && (           
                            <Link
                              href={workout.workoutUrl}
                              target="_blank"
                              className="mt-4 w-full inline-flex items-center justify-center px-5 py-2 rounded-xl bg-gray-600 text-white font-semibold shadow-md hover:from-blue-600 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                              <span className="mr-2">▶️</span>
                              Video Tutorial
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">😴</span>
                      </div>
                      <p className="text-lg text-gray-600 font-medium">{t('restDay')}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Workout Details Modal */}
        {selectedDay && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">{selectedDay.weekDay}</h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                <div className="space-y-4">
                  {selectedDay.workouts.map((workout, index) => (
                    <div
                      key={index}
                      className={`rounded-2xl p-5 border-2 transition-all duration-300 ${
                        loggedWorkouts[getLogKey(selectedDay.weekDay, today)]?.logged 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                          : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
                      }`}
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{workout.name}</h3>
                      {workout.workoutImages && workout.workoutImages.length > 0 && (
                        <div className="mt-3 overflow-x-auto">
                          <div className="flex gap-3 p-2 rounded-xl bg-gray-100" style={{ minHeight: '120px' }}>
                          {workout.workoutImages.map((image: string, imgIndex: number) => (
                            <img
                            key={imgIndex}
                            src={image}
                            alt={`Workout Image ${imgIndex + 1}`}
                            className="w-auto h-28 rounded-lg object-contain flex-shrink-0"
                            />
                          ))}
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div className="text-center">
                          <p className="text-sm text-gray-500 font-medium">{t('sets')}</p>
                          <p className="text-2xl font-bold text-blue-600">{workout.sets}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500 font-medium">{t('reps')}</p>
                          <p className="text-2xl font-bold text-purple-600">{workout.reps}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500 font-medium">{t('weight')}</p>
                          <p className="text-2xl font-bold text-indigo-600">{workout.targetWeight || '—'}</p>
                        </div>
                      </div>
                      {workout.comment && (
                        <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200">
                          <p className="text-sm text-gray-600 italic">{workout.comment}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  {dueToday ? (
                    <button
                      className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
                        loggedWorkouts[getLogKey(selectedDay.weekDay, today)]?.logged
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
                      }`}
                      onClick={() => handleLogWorkout(selectedDay)}
                      disabled={loggedWorkouts[getLogKey(selectedDay.weekDay, today)]?.logged || !dueToday}
                    >
                      {loggedWorkouts[getLogKey(selectedDay.weekDay, today)]?.logged 
                        ? t('workoutCompleted') 
                        : t('logWorkout')
                      }
                    </button>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 italic">{t('contactCoachConcerns')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Log Workout Confirmation Modal */}
        {logModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💪</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t('workoutCompletionConfirmation', { weekday: format.dateTime(today, { weekday: 'long' }) })}
                  </h3>

                  <p className="text-gray-600">{t('howDidItGo')}</p>
                </div>
                
                <textarea
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 mb-6"
                  placeholder={t('addCommentOptional')}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
                
                <div className="flex space-x-3">
                  <button
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                    onClick={() => handleLogComplete(selectedDay!)}
                  >
                    {t('markComplete')}
                  </button>
                  <button
                    className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-2xl font-bold transition-all duration-300 hover:bg-gray-300"
                    onClick={() => {
                      setLogModalOpen(false);
                      setComment('');
                    }}
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientWorkoutDashboard;