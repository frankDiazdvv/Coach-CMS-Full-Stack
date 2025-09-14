'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AddMealModal from './AddMealModal';
import ViewMealDetails from './ViewMealDetailsModal';
import { useTranslations } from 'next-intl';
import { FaRegCommentDots } from 'react-icons/fa';
import AddMealFromLibraryModal from './AddMealFromLibraryModal';
import { ISavedMeal } from '../../../../lib/models/savedMeals';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface INutritionFood {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface INutritionItem {
  mealName: string;
  foods: INutritionFood[];
  comment?: string;
}

interface INutritionDay {
  weekDay: string;
  items: INutritionItem[];
}

const AddNutritionPage: React.FC = () => {
  const t = useTranslations();
  const tWeekday = useTranslations('weekdays');
  const router = useRouter();
  const [schedule, setSchedule] = useState<INutritionDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedLibraryDay, setSelectedLibraryDay] = useState<string | null>(null); //Day of the week selected
  const [selectedMeal, setSelectedMeal] = useState<{
    day: string;
    index: number;
    meal: INutritionItem;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingLibrary, setLoadingLibrary] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false); // Mode flag
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false); //Is library open?
  const [mealLibrary, setMealLibrary] = useState<ISavedMeal[]>([]); //All elements in the library of meals
  const [selectedLibraryMeal, setSelectedLibraryMeal] = useState<ISavedMeal | null>(null); //Meal selected after clicking on an element in the library
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

  useEffect(() => {
    // Fetch nutrition schedule from the database
    const nutritionScheduleId = localStorage.getItem('nutritionScheduleId');
    const clientFirstName = localStorage.getItem('userFirstName');
    const clientLastName = localStorage.getItem('userLastName');

    setFirstName(clientFirstName || '');
    setLastName(clientLastName || '');

    if (nutritionScheduleId) {
      setIsEditing(true);
      fetchNutritionSchedule(nutritionScheduleId);
    } else {
      // If not created, load schedule from local storage (meaning we are creating a new user in the addClientModal)
      const storedSchedule = localStorage.getItem('nutritionSchedule');
      if (storedSchedule) {
        const parsedSchedule = JSON.parse(storedSchedule);
        // Filter out invalid meals
        const validSchedule = parsedSchedule.map((day: INutritionDay) => ({
          ...day,
          items: day.items.filter((item) => Array.isArray(item.foods) && item.foods.length > 0),
        })).filter((day: INutritionDay) => day.items.length > 0);
        setSchedule(validSchedule);
        console.log('Loaded schedule:', validSchedule); // Debug log
      }
      setLoading(false);
    }
  }, []);

  const fetchNutritionSchedule = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`/api/nutritionSchedule/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch nutrition schedule');

      const data = await response.json();
      if (data.schedule && Array.isArray(data.schedule)) {
        setSchedule(data.schedule);
      } else {
        setError('Invalid schedule data from API');
        setSchedule([]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("genericError");
      console.log(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const calculateMacros = (items: INutritionItem[]) => {
    return items.reduce(
      (totals, item) => {
        const mealMacros = Array.isArray(item.foods)
          ? item.foods.reduce(
              (mealTotals, food) => ({
                calories: mealTotals.calories + food.calories,
                protein: mealTotals.protein + food.protein,
                carbs: mealTotals.carbs + food.carbs,
                fats: mealTotals.fats + food.fats,
              }),
              { calories: 0, protein: 0, carbs: 0, fats: 0 }
            )
          : { calories: 0, protein: 0, carbs: 0, fats: 0 };
        return {
          calories: Math.round(totals.calories + mealMacros.calories),
          protein: Math.round(totals.protein + mealMacros.protein),
          carbs: Math.round(totals.carbs + mealMacros.carbs),
          fats: Math.round(totals.fats + mealMacros.fats),
        };
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const totalMacros = schedule.reduce(
    (totals, day) => {
      const dayMacros = calculateMacros(day.items);
      return {
        calories: totals.calories + dayMacros.calories,
        protein: totals.protein + dayMacros.protein,
        carbs: totals.carbs + dayMacros.carbs,
        fats: totals.fats + dayMacros.fats,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const daysWithMeals = schedule.filter(day => day.items.length > 0).length || 1;

  const weeklyAverages = useMemo(() => {
    return{
      calories: Math.round(totalMacros.calories / daysWithMeals),
      protein: Math.round(totalMacros.protein / daysWithMeals),
      carbs: Math.round(totalMacros.carbs / daysWithMeals),
      fats: Math.round(totalMacros.fats / daysWithMeals),
    };
  }, [totalMacros, daysWithMeals]);

  useEffect(() => {
    const clientId = localStorage.getItem('id');
    if (clientId) {
      localStorage.setItem(`weekMacroAverage_${clientId}`, JSON.stringify(weeklyAverages));
    }
  }, [schedule, weeklyAverages]);

  const handleOpenDetails = (day: string, index: number, meal: INutritionItem) => {
    setSelectedMeal({ day, index, meal });
  };

  const handleOpenMealLibrary = async (day: string) => {
    const id = localStorage.getItem("id");

    setIsLibraryOpen(true);
    setLoadingLibrary(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`/api/savedMeals?coachId=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch you saved meals');
      const data = await response.json();
      setMealLibrary(data);
      setSelectedLibraryDay(day)
      
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t("genericError");
        console.log(err);
        setError(message);
    } finally {
        setLoadingLibrary(false);
    }
  };

  const handleSelectMeal = (meal: INutritionItem) => {
    console.log("Handling meal: ", meal);
    console.log("Selected Library Day: ", selectedLibraryDay);
    
    if (selectedDay) {
      setSchedule((prev) => {
        const existingDay = prev.find((d) => d.weekDay === selectedDay);
        if (existingDay) {
          return prev.map((d) =>
            d.weekDay === selectedDay
              ? { ...d, items: [...d.items, meal] }
              : d
          );
        }
        return [...prev, { weekDay: selectedDay, items: [meal] }];
      });
    } else if (selectedLibraryDay) {
      setSchedule((prev) => {
        const existingDay = prev.find((d) => d.weekDay === selectedLibraryDay);
        if (existingDay) {
          return prev.map((d) =>
            d.weekDay === selectedLibraryDay
              ? { ...d, items: [...d.items, meal] }
              : d
          );
        }
        return [...prev, { weekDay: selectedLibraryDay, items: [meal] }];
      });
    }
  };

  const handleAddMeal = (day: string) => {
    setSelectedDay(day);
  };

  const handleSaveMeal = (updatedMeal: INutritionItem) => {
    if (selectedMeal) {
      setSchedule((prev) =>
        prev.map((d) =>
          d.weekDay === selectedMeal.day
            ? {
                ...d,
                items: d.items.map((item, i) =>
                  i === selectedMeal.index ? updatedMeal : item
                ),
              }
            : d
        )
      );
      setSelectedMeal(null);
    }
  };

  const handleDeleteMeal = () => {
    if (selectedMeal) {
      setSchedule((prev) =>
        prev.map((d) =>
          d.weekDay === selectedMeal.day
            ? {
                ...d,
                items: d.items.filter((_, i) => i !== selectedMeal.index),
              }
            : d
        )
      );
      setSelectedMeal(null);
    }
  };

  const handleConfirmNutrition = async () => {
    if (isEditing) {
      const nutritionScheduleId = localStorage.getItem('nutritionScheduleId');
      if (!nutritionScheduleId) {
        setError('No nutrition schedule ID found');
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token');

        const response = await fetch(`/api/nutritionSchedule/${nutritionScheduleId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ schedule, operation: 'replace' }), // Use replace operation
        });

        if (!response.ok) throw new Error('Failed to update nutrition schedule');

        localStorage.removeItem('nutritionScheduleId');
        router.push(`/coach/all-clients`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t("genericError");
        setError(message);
      } finally {
        setLoading(false);
      }
    } else {
      localStorage.setItem('nutritionSchedule', JSON.stringify(schedule));
      localStorage.setItem('openModalAfterWorkout', 'true');
      router.push(`/coach/coach-dashboard`); // Redirect back to AddClientModal
    }
  };

  const handleCancelCreation = () => {
    if(isEditing){
      localStorage.removeItem('nutritionScheduleId');
      localStorage.removeItem('nutritionNotes'); // Clear notes
      router.push(`/coach/all-clients`);
    } else {
      localStorage.removeItem('nutritionSchedule');
      localStorage.removeItem('nutritionNotes'); // Clear notes
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
  
 return (
    <div className="fixed z-200 left-0 right-0 min-h-screen bg-gray-100 p-4 cursor-default">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className='flex gap-2'>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {isEditing ? t('editNutritionPlan') : t('buildNutritionPlan')}
            </h1>
            <p className="flex items-center text-sm text-gray-500"> - {getCurrentDate()}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancelCreation}
              disabled={loading}
              className="inline-flex cursor-pointer items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium rounded-xl shadow-md hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {t('cancel')}
            </button>
            <button
              onClick={handleConfirmNutrition}
              disabled={loading}
              className="inline-flex cursor-pointer items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl shadow-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  {isEditing ? t('saveChanges') : t('savePlan')}
                </>
              )}
            </button>
          </div>
        </div>
        {/* Weekly Macros & Client Name */}
        <div className="flex flex-row gap-2">
          {isEditing   && firstName && lastName && (
            <span className="inline-flex text-md items-center px-3 h-12 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <span className='font-semibold pr-1'>{t('client')}:</span> {firstName} {lastName}
            </span>
          )}
          {/* Weekly Average Numbers */}
          <div className="inline-flex gap-2 items-center px-4 h-12 rounded-full text-sm font-medium bg-green-50 text-green-800 border border-green-200">
            <div className='flex self-center'>
              <h3 className='text-md font-semibold'>{t("weeklyMacroAverage")}:</h3>
            </div>
            <div className="flex flex-row gap-4">
              <div>
                <p className="text-sm font-semibold text-orange-600">{t("calories")}</p>
                <p className="text-xs">{weeklyAverages.calories} kcal</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-600">{t("protein")}</p>
                <p className="text-xs">{weeklyAverages.protein} g</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-600">Carbs</p>
                <p className="text-xs">{weeklyAverages.carbs} g</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-purple-600">{t("fats")}</p>
                <p className="text-xs">{weeklyAverages.fats} g</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      

      {/* Meal Plan Editor */}
      <div className="fixed bottom-4 left-4 right-4 top-32 rounded-lg shadow-lg pt-2 bg-white">
        <div className="grid grid-cols-7 h-full p-0 overflow-y-auto">
          {daysOfWeek.map((day) => {
            const dayMacros = calculateMacros(
              schedule.find((d) => d.weekDay === day)?.items || []
            );
            return (
              <div key={day} className="flex flex-col items-center h-full">
                <h3 className="text-base font-semibold text-gray-700 mb-2">{tWeekday(day)}</h3>
                <div className="flex items-center gap-2 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm mb-2">
                  <span className="text-orange-600 font-semibold">{dayMacros.calories}kcal</span>
                  <div className="w-px h-4 bg-gray-200"></div>
                  <span className="text-blue-600 font-semibold">{dayMacros.protein}g</span>
                  <div className="w-px h-4 bg-gray-200"></div>
                  <span className="text-green-600 font-semibold">{dayMacros.carbs}g</span>
                  <div className="w-px h-4 bg-gray-200"></div>
                  <span className="text-purple-600 font-semibold">{dayMacros.fats}g</span>
                </div>
                <div className="flex-1 flex-col p-1 gap-1 w-full border-x border-slate-200 justify-center">
                  {/* ADD MEALS BUTTONS */}
                  <div className='flex flex-row gap-1'>
                    <button
                      onClick={() => handleAddMeal(day)}
                      disabled={loading}
                      className="w-full mb-1.5 px-2 py-1 cursor-pointer border-2 border-dashed border-green-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-green-600 group-hover:text-green-700">
                          {t('addMeal')}
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleOpenMealLibrary(day)}
                      disabled={loading}
                      className="w-full mb-1.5 px-2 py-1 cursor-pointer border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                          {t("fromMealLibrary")}
                        </span>
                      </div>
                    </button>
                  </div>                  

                  {/* Display meals for the day */}
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                  ) : 
                  <DragDropContext
                    onDragEnd={(result) => {
                      if (!result.destination) return;

                      const { source, destination } = result;

                      setSchedule((prev) =>
                        prev.map((d) => {
                          if (d.weekDay !== day) return d;

                          const reordered = Array.from(d.items);
                          const [moved] = reordered.splice(source.index, 1);
                          reordered.splice(destination.index, 0, moved);

                          return { ...d, items: reordered };
                        })
                      );
                    }}
                  >
                    <Droppable droppableId={day}>
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="flex-1 flex-col p-1 gap-1 w-full justify-center"
                        >
                          {Array.isArray(schedule) && schedule.length > 0 && schedule.find((d) => d.weekDay === day)
                                ?.items.map((meal, index) => (
                            <Draggable key={`${day}-${index}`} draggableId={`${day}-${index}`} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <div
                                    key={index}
                                    onClick={() => handleOpenDetails(day, index, meal)}
                                    className="w-full p-3 mb-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 hover:shadow-md cursor-pointer transition-all duration-200 transform hover:scale-105"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="text-sm font-semibold text-gray-800 truncate">{meal.mealName}</h4>
                                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </div>
                                    <div className="flex flex-row justify-between">
                                      <p  className="text-xs text-gray-600 truncate">
                                        {t("ingredientsInMeal", {count: meal.foods.length})}
                                      </p>
                                      {meal.comment && (
                                        <p className="text-xs self-center text-amber-600 font-medium"><FaRegCommentDots/></p>
                                      )}
                                    </div>
                                    
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  
                  
                    
                    }
                </div>
              </div>
            );
          })}
        </div>
      </div>  

      {/* OPENING MEAL LIBRARY */}
      {isLibraryOpen && selectedLibraryDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[95vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold cursor-default text-white">
                  {t("mealLibrary")}
                </h2>
                <button
                  onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                  className="cursor-pointer text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 min-h-60">
              <div className="w-full">
                {loadingLibrary ? (
                  <div className='flex justify-center h-40'>
                      <p className='self-center text-gray-400 font-semibold animate-pulse'>{t("loadingYourMeals")}</p>
                  </div>
                  ) : (
                    mealLibrary.length > 0 ? (
                      mealLibrary.map((meal, index) => (
                        <p 
                          className='cursor-pointer self-center font-semibold border-b p-2 py-4 hover:bg-gray-50' 
                          key={meal._id.toString()}
                          onClick={() => setSelectedLibraryMeal(meal)}
                        >
                            {index + 1} - {meal.mealName}
                        </p>
                      ))
                    ) : (
                      <div className='flex justify-center h-40'>
                          <p className='self-center text-gray-400 font-semibold'>{t("noMeals")}</p>
                      </div>
                    )
                  )}                  
              </div>
            </div>
          </div>
        </div>
      )} 
       

      {/* Add Meal Modal */}
      <AddMealModal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        onSelectMeal={handleSelectMeal}
      />

      
      {/* Add Meal From Library Modal */}
      {selectedLibraryMeal && (
        <AddMealFromLibraryModal
          isOpen={true}
          libraryMeal={selectedLibraryMeal}
          onClose={() => {
            setSelectedLibraryDay(null);
            setSelectedLibraryMeal(null);
          }}
          onSelectMeal={handleSelectMeal}
        />
      )}

      {/* On Click View Meal Details */}
      {selectedMeal && (
        <ViewMealDetails
          isOpen={!!selectedMeal}
          meal={selectedMeal.meal}
          onClose={() => setSelectedMeal(null)}
          onSave={handleSaveMeal}
          onDelete={handleDeleteMeal}
        />
      )}
    </div>
  );
};

export default AddNutritionPage;