'use client';

import { useState, useEffect } from 'react';
import { INutritionDay, INutritionItem, INutritionFood } from '../../../../lib/models/nutrition';
import { useTranslations } from 'next-intl';

const ClientNutritionDashboard: React.FC = () => {
  const t = useTranslations();
  const [clientSchedule, setClientSchedule] = useState<INutritionDay[] | null>(null);
  const [clientName, setClientName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekMacroAverage, setWeekMacroAverage] = useState<{ calories: number; protein: number; carbs: number; fats: number } | null>(null);
  const [fullSchedule, setFullSchedule] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<INutritionItem | null>(null);

  useEffect(() => {
    setClientName(localStorage.getItem('name') || 'User');

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
        console.error('Invalid client ID:', err);
        setError('Invalid client ID');
        setIsLoading(false);
      }
    };
    initializeData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const nutritionScheduleId = localStorage.getItem('nutritionScheduleId');
    if (!token || !nutritionScheduleId) {
      setError('No token or nutrition schedule ID found');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/nutritionSchedule/${nutritionScheduleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || 'Failed to fetch nutrition schedule');
      }

      const data = await response.json();
      console.log('Fetched data:', data);

      setClientSchedule(data.schedule);

      if (data.schedule && Array.isArray(data.schedule)) {
        const totalMacros = data.schedule.reduce(
          (totals: { calories: number; protein: number; carbs: number; fats: number }, day: { items: INutritionItem[] }) => {
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
        const daysWithMeals = data.schedule.filter((day: { items: INutritionItem[] }) => day.items.length > 0).length || 1;
        const averages = {
          calories: Math.round(totalMacros.calories / daysWithMeals),
          protein: Math.round(totalMacros.protein / daysWithMeals),
          carbs: Math.round(totalMacros.carbs / daysWithMeals),
          fats: Math.round(totalMacros.fats / daysWithMeals),
        };
        setWeekMacroAverage(averages);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("genericError");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMacros = (items: INutritionItem[]) => {
    return items.reduce(
      (totals, item) => {
        const mealMacros = Array.isArray(item.foods)
          ? item.foods.reduce(
              (mealTotals, food: INutritionFood) => ({
                calories: mealTotals.calories + (food.calories || 0),
                protein: mealTotals.protein + (food.protein || 0),
                carbs: mealTotals.carbs + (food.carbs || 0),
                fats: mealTotals.fats + (food.fats || 0),
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  console.log('Today:', today);

  const weekdayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const sortedSchedule = clientSchedule?.sort((a, b) => {
    return weekdayOrder.indexOf(a.weekDay) - weekdayOrder.indexOf(b.weekDay);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
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
            {t("greeting")}, <span className="text-green-600">{clientName}</span>
          </h1>
          <p className="text-gray-600">{t("readyToFuel")}</p>
        </div>

        {/* Today's Meal Plan Hero Section */}
        <div className="mb-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="text-2xl mr-3">🍽️</span>
                {t("todayMealPlan")}
              </h2>
              <p className="text-green-100 mt-1">
                {today.toLocaleDateString(t("locale"), { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            <div className="p-6">
              {sortedSchedule?.find((day) => day.weekDay === today.toLocaleDateString('en-US', { weekday: 'long' }))?.items.length ? (
                <div className="space-y-4">
                  {sortedSchedule
                    .find((day) => day.weekDay === today.toLocaleDateString('en-US', { weekday: 'long' }))
                    ?.items.map((meal, index) => {
                      const mealMacros = Array.isArray(meal.foods)
                        ? meal.foods.reduce(
                            (totals, food: INutritionFood) => ({
                              calories: totals.calories + (food.calories || 0),
                              protein: totals.protein + (food.protein || 0),
                              carbs: totals.carbs + (food.carbs || 0),
                              fats: totals.fats + (food.fats || 0),
                            }),
                            { calories: 0, protein: 0, carbs: 0, fats: 0 }
                          )
                        : { calories: 0, protein: 0, carbs: 0, fats: 0 };

                      return (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-5 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-300 cursor-pointer"
                          onClick={() => {
                            setIsModalOpen(true);
                            setSelectedMeal(meal);
                          }}
                        >
                          <h3 className="text-xl font-bold text-gray-900 mb-3">{meal.mealName}</h3>
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div className="text-center">
                              <p className="text-sm text-gray-500 font-medium">{t("calories")}</p>
                              <p className="text-lg font-bold text-orange-600">{Math.round(mealMacros.calories)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500 font-medium">{t("protein")}</p>
                              <p className="text-lg font-bold text-red-600">{Math.round(mealMacros.protein)}g</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500 font-medium">{t("carbs")}</p>
                              <p className="text-lg font-bold text-green-600">{Math.round(mealMacros.carbs)}g</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500 font-medium">{t("fats")}</p>
                              <p className="text-lg font-bold text-yellow-600">{Math.round(mealMacros.fats)}g</p>
                            </div>
                          </div>
                          {meal.comment && (
                            <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200">
                              <p className="text-sm text-gray-600 italic flex items-center">
                                <span className="text-red-500 mr-2">💬</span>
                                {meal.comment}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🍽️</span>
                  </div>
                  <p className="text-xl text-gray-600 font-medium">{t("noMealPlanned")}</p>
                  <p className="text-gray-500 mt-2">{t("contactCoachforMeal")}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Macro Average Section */}
        <div className="mb-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="text-2xl mr-3">📊</span>
                {t("weeklyMacroAverage")}
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-2xl border border-orange-200">
                  <div className="text-center">
                    <p className="text-gray-600 text-lg font-semibold">{t("calories")}</p>
                    <p className="text-2xl font-bold text-orange-600">{weekMacroAverage?.calories}</p>
                    <p className="text-sm text-gray-500 mt-1">kcal</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-2xl border border-red-200">
                  <div className="text-center">
                    <p className="text-gray-600 text-lg font-semibold">{t("protein")}</p>
                    <p className="text-2xl font-bold text-red-600">{weekMacroAverage?.protein}</p>
                    <p className="text-sm text-gray-500 mt-1">{t("grams")}</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl border border-green-200">
                  <div className="text-center">
                    <p className="text-gray-600 text-lg font-semibold">{t("carbs")}</p>
                    <p className="text-2xl font-bold text-green-600">{weekMacroAverage?.carbs}</p>
                    <p className="text-sm text-gray-500 mt-1">{t("grams")}</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-2xl border border-yellow-200">
                  <div className="text-center">
                    <p className="text-gray-600 text-lg font-semibold">{t("fats")}</p>
                    <p className="text-2xl font-bold text-yellow-600">{weekMacroAverage?.fats}</p>
                    <p className="text-sm text-gray-500 mt-1">{t("grams")}</p>
                  </div>
                </div>
              </div>
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
                  {fullSchedule ? t("hideFullSchedule") : t("viewFullSchedule")}
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
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{t("weeklyNutritionSchedule")}</h3>
            {sortedSchedule?.map((daySchedule) => (
              <div key={daySchedule.weekDay} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4">
                  <h4 className="text-xl font-bold text-white">{daySchedule.weekDay}</h4>
                </div>
                
                <div className="p-6">
                  {daySchedule.items.length > 0 ? (
                    <div className="space-y-4">
                      {daySchedule.items.map((meal, index) => {
                        const mealMacros = Array.isArray(meal.foods)
                          ? meal.foods.reduce(
                              (totals, food: INutritionFood) => ({
                                calories: totals.calories + (food.calories || 0),
                                protein: totals.protein + (food.protein || 0),
                                carbs: totals.carbs + (food.carbs || 0),
                                fats: totals.fats + (food.fats || 0),
                              }),
                              { calories: 0, protein: 0, carbs: 0, fats: 0 }
                            )
                          : { calories: 0, protein: 0, carbs: 0, fats: 0 };

                        return (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-5 border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer"
                            onClick={() => {
                              setIsModalOpen(true);
                              setSelectedMeal(meal);
                            }}
                          >
                            <h5 className="text-lg font-bold text-gray-900 mb-3">{meal.mealName}</h5>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                              <div className="text-center">
                                <p className="text-sm text-gray-500 font-medium">{t("calories")}</p>
                                <p className="text-lg font-bold text-orange-600">{Math.round(mealMacros.calories)}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-500 font-medium">{t("protein")}</p>
                                <p className="text-lg font-bold text-red-600">{Math.round(mealMacros.protein)}g</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-500 font-medium">{t("carbs")}</p>
                                <p className="text-lg font-bold text-green-600">{Math.round(mealMacros.carbs)}g</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-500 font-medium">{t("fats")}</p>
                                <p className="text-lg font-bold text-yellow-600">{Math.round(mealMacros.fats)}g</p>
                              </div>
                            </div>
                            {meal.comment && (
                              <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200">
                                <p className="text-sm text-gray-600 italic flex items-center">
                                  <span className="text-red-500 mr-2">💬</span>
                                  {meal.comment}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🍽️</span>
                      </div>
                      <p className="text-lg text-gray-600 font-medium">{t("noMealsPlanned")}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Meal Details */}
        {selectedMeal && isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">{selectedMeal.mealName}</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* Ingredients List */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="text-2xl mr-3">🥘</span>
                    {t("ingredients")}
                  </h3>
                  <div className="space-y-3">
                    {selectedMeal.foods.map((food, index) => (
                      <div key={index} className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-2xl border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg mb-2">{food.name}</h4>
                            <p className="text-sm text-gray-600 mb-3">
                              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                {food.quantity} {food.unit}
                              </span>
                            </p>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                              <div className="text-center">
                                <p className="text-xs text-gray-500">{t("calories")}</p>
                                <p className="font-bold text-orange-600">{Math.round(food.calories)}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500">{t("protein")}</p>
                                <p className="font-bold text-red-600">{Math.round(food.protein)}g</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500">{t("carbs")}</p>
                                <p className="font-bold text-green-600">{Math.round(food.carbs)}g</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500">{t("fats")}</p>
                                <p className="font-bold text-yellow-600">{Math.round(food.fats)}g</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Macros */}
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                  <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                    <span className="text-2xl mr-3">📊</span>
                    {t("totalMacros")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="text-center">
                      <p className="text-sm text-blue-700 font-medium">{t("calories")}</p>
                      <p className="text-2xl font-bold text-orange-600">{Math.round(calculateMacros([selectedMeal]).calories)}</p>
                      <p className="text-xs text-blue-600">kcal</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-blue-700 font-medium">{t("protein")}</p>
                      <p className="text-2xl font-bold text-red-600">{Math.round(calculateMacros([selectedMeal]).protein)}</p>
                      <p className="text-xs text-blue-600">{t("grams")}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-blue-700 font-medium">{t("carbs")}</p>
                      <p className="text-2xl font-bold text-green-600">{Math.round(calculateMacros([selectedMeal]).carbs)}</p>
                      <p className="text-xs text-blue-600">{t("grams")}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-blue-700 font-medium">{t("fats")}</p>
                      <p className="text-2xl font-bold text-yellow-600">{Math.round(calculateMacros([selectedMeal]).fats)}</p>
                      <p className="text-xs text-blue-600">{t("grams")}</p>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                {selectedMeal.comment && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200">
                    <h3 className="text-xl font-bold text-yellow-900 mb-3 flex items-center">
                      <span className="text-2xl mr-3">💬</span>
                      {t("note")}
                    </h3>
                    <p className="text-yellow-800 leading-relaxed">{selectedMeal.comment}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientNutritionDashboard;