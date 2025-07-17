'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AddMealModal from './AddMealModal';
import ViewMealDetails from './ViewMealDetailsModal';

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
  const router = useRouter();
  const [schedule, setSchedule] = useState<INutritionDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<{
    day: string;
    index: number;
    meal: INutritionItem;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false); // Mode flag
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [notes, setNotes] = useState<string>(''); // Maintain notes state


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
    const storedNotes = localStorage.getItem('nutritionNotes'); // Load notes

    setFirstName(clientFirstName || '');
    setLastName(clientLastName || '');
    if (storedNotes) setNotes(storedNotes);

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
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching nutrition schedule');
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

  const weeklyAverages = {
    calories: Math.round(totalMacros.calories / daysWithMeals),
    protein: Math.round(totalMacros.protein / daysWithMeals),
    carbs: Math.round(totalMacros.carbs / daysWithMeals),
    fats: Math.round(totalMacros.fats / daysWithMeals),
  };

  useEffect(() => {
    const clientId = localStorage.getItem('id');
    if (clientId) {
      localStorage.setItem(`weekMacroAverage_${clientId}`, JSON.stringify(weeklyAverages));
    }
  }, [schedule, weeklyAverages]);

  const handleOpenDetails = (day: string, index: number, meal: INutritionItem) => {
    setSelectedMeal({ day, index, meal });
  };

  const handleSelectMeal = (meal: INutritionItem) => {
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
      } catch (err: any) {
        setError(err.message);
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

  return (
    <div className="fixed left-20 right-0 min-h-screen bg-gray-100 p-4">
      {/* Macro Summary */}
      <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
        <div className='flex justify-between items-center mb-8'>
          <h2 className="text-2xl font-bold text-gray-800">
           {isEditing ? `Weekly Macro Average - ${firstName} ${lastName}` : `Macro Summary - Weekly Average`}
          </h2>
          {/* Save or Cancel Plan Button */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancelCreation}
              className="rounded-md bg-gray-400 px-4 py-2 text-white hover:bg-gray-500 cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmNutrition}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 cursor-pointer"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Plan and Exit'}
            </button>
          </div>
        </div>
        
        
        <div className="grid grid-cols-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Calories</p>
            <p className="text-lg">{weeklyAverages.calories} kcal</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Protein</p>
            <p className="text-lg">{weeklyAverages.protein} g</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Carbs</p>
            <p className="text-lg">{weeklyAverages.carbs} g</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Fats</p>
            <p className="text-lg">{weeklyAverages.fats} g</p>
          </div>
        </div>
      </div>

      {/* Meal Plan Editor */}
      <div className="mb-6 bg-white rounded-lg shadow-lg p-4">
        <div className="grid grid-cols-7">
          {daysOfWeek.map((day) => {
            const dayMacros = calculateMacros(
              schedule.find((d) => d.weekDay === day)?.items || []
            );
            return (
              <div key={day} className="flex flex-col items-center">
                <h3 className="text-base font-semibold text-gray-700 mb-2">{day}</h3>
                <div className="gap-3 text-xs mb-2">
                  <p><b>C:</b> {dayMacros.calories} kcal</p>
                  <p><b>P:</b> {dayMacros.protein}g</p>
                  <p><b>Ca:</b> {dayMacros.carbs}g</p>
                  <p><b>F:</b> {dayMacros.fats}g</p>
                </div>
                <div className="flex flex-col gap-1 w-full h-85 border-x border-gray-300 items-center justify-center">
                  <button
                    onClick={() => handleAddMeal(day)}
                    className="text-2xl text-blue-500 hover:text-blue-700 mb-2"
                    disabled={loading}
                  >
                    +
                  </button>
                  {loading ? (
                    <p className="text-gray-600">Loading Information...</p>
                  ) : Array.isArray(schedule) && schedule.length > 0 && schedule.find((d) => d.weekDay === day)
                    ?.items.map((meal, index) => (
                      <div
                        key={index}
                        onClick={() => handleOpenDetails(day, index, meal)}
                        className="w-11/12 p-2 border rounded bg-gray-100 hover:brightness-110 cursor-pointer"
                      >
                        <h4 className="text-sm font-semibold">{meal.mealName}</h4>
                        {meal.foods?.map((food, foodIndex) => (
                          <p key={foodIndex} className="text-xs">
                            {food.quantity}({food.unit}) - {food.name}
                          </p>
                        ))}
                        {meal.comment && <p className="text-xs text-red-800">Contains Comment</p>}
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      

      {/* Add Meal Modal */}
      <AddMealModal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        onSelectMeal={handleSelectMeal}
      />

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