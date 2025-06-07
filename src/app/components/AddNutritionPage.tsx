'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AddMealModal from './AddMealModal';
import ViewMealDetails from './ViewMealDetailsModal';
import NutritionSchedule from '../../../lib/models/nutrition';

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
    day: string,
    index: number,
    meal: INutritionItem,
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

    const storedSchedule = localStorage.getItem('nutritionSchedule');
    const storedNotes = localStorage.getItem('nutritionNotes');
    if (storedSchedule) {
      const parsedSchedule = JSON.parse(storedSchedule);
      //Filter out invalid meals
      const validSchedule = parsedSchedule.map((day: INutritionDay) => ({
        ...day,
        items: day.items.filter((item) => Array.isArray(item.foods) && item.foods.length > 0),
      })).filter((day: INutritionDay) => day.items.length > 0);
      setSchedule(validSchedule);
      console.log('Loaded schedule:', validSchedule); // Debug log
    }
  }, []);

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

  const handleConfirmNutrition = () => {
    localStorage.setItem('nutritionSchedule', JSON.stringify(schedule));
    localStorage.setItem('openModalAfterWorkout', 'true');
    router.push(`/client-side/coach-dashboard`);
  };

  const handleCancelCreation = () => {
    localStorage.removeItem('nutritionSchedule');
    localStorage.setItem('openModalAfterWorkout', 'true');
    router.push(`/client-side/coach-dashboard`);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Macro Summary */}
      <div className="mb-6 bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Macro Summary - Weekly Average</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Calories</p>
            <p className="text-lg">{(weeklyAverages.calories)} kcal</p>
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
        <h2 className="text-xl font-bold text-gray-800 mb-2">Meal Plan Editor</h2>
        <div className="grid grid-cols-7 gap-4">
          {daysOfWeek.map((day) => {
            const dayMacros = calculateMacros(
              schedule.find((d) => d.weekDay === day)?.items || []
            );
            return (
              <div key={day} className="flex flex-col items-center">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{day}</h3>
                <div className="text-xs mb-2">
                  <p>C: {dayMacros.calories} kcal</p>
                  <p>P: {dayMacros.protein}g</p>
                  <p>Ca: {dayMacros.carbs}g</p>
                  <p>F: {dayMacros.fats}g</p>
                </div>
                <div className="flex flex-col gap-1 w-full h-64 border border-gray-300 rounded-md items-center justify-center bg-gray-50">
                  <button
                    onClick={() => handleAddMeal(day)}
                    className="text-2xl text-blue-500 hover:text-blue-700 mb-2"
                  >
                    +
                  </button>
                  {schedule.find((d) => d.weekDay === day)
                    ?.items.map((meal, index) => (
                      <div
                        key={index}
                        onClick={() => handleOpenDetails(day,index, meal)}
                        className="w-11/12 p-2 border rounded bg-gray-100 hover:brightness-110 cursor-pointer"
                      >
                        <h4 className="text-sm font-semibold">{meal.mealName}</h4>
                        {meal.foods?.map((food, foodIndex) => (
                          <p key={foodIndex} className="text-xs">
                            {food.quantity}({food.unit}) - {food.name}
                          </p>
                        ))}
                        {meal.comment && 
                          <p className="text-xs text-red-800">Contains Comment</p>}
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save or Cancel Plan Button */}
      <div className="flex justify-end gap-3">
        <button 
        onClick={handleCancelCreation}
         className='rounded-md bg-gray-400 px-4 py-2 text-white hover:bg-gray-500 cursor-pointer'
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmNutrition}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 cursor-pointer"
        >
          Save Plan
        </button>
      </div>

      {/* Add Meal Modal */}
      <AddMealModal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        onSelectMeal={handleSelectMeal}
      />

      {/* On Click View Meal Details */}
      {selectedMeal &&
        <ViewMealDetails
          isOpen={!!selectedMeal}
          meal={selectedMeal?.meal}
          onClose={() => setSelectedMeal(null)}
          onSave={handleSaveMeal}
          onDelete={handleDeleteMeal}
      />
      }
      
    </div>
  );
};

export default AddNutritionPage;