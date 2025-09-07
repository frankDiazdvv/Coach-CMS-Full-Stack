'use client';
// MEAL ALREADY SAVES TO LIBRARY. NOW i NEED TO CREATE A LIBRARY MODAL TO VIEW AND ADD MEALS TO THE DAY SELECTED!!!!







import { useState } from 'react';
import FoodSearchModal from './FoodSearchModal';
import AddCustomFoodModal from './AddCustomFoodModal';
import { useTranslations } from 'next-intl';
import {Ellipsis} from 'lucide-react'

interface INutritionFood {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface ViewMealDetailsProps {
  isOpen: boolean;
  meal: {
    mealName: string;
    foods: INutritionFood[];
    comment?: string;
  };
  onClose: () => void;
  onSave: (updatedMeal: {
    mealName: string;
    foods: INutritionFood[];
    comment?: string;
  }) => void;
  onDelete: () => void;
}

const ViewMealDetails: React.FC<ViewMealDetailsProps> = ({
  isOpen,
  meal,
  onClose,
  onSave,
  onDelete,
}) => {
  const t = useTranslations();
  const [mealName, setMealName] = useState(meal.mealName);
  const [foods, setFoods] = useState<INutritionFood[]>(meal.foods);
  const [comment, setComment] = useState(meal.comment || '');
  const [isFoodSearchOpen, setIsFoodSearchOpen] = useState(false);
  const [isCustomFoodOpen, setIsCustomFoodOpen] = useState(false);
  const [isPopUpMenuOpen, setIsPopUpMenuOpen] = useState(false);

  // Calculate total macros
  const totalMacros = foods.reduce((totals, food) => ({
    calories: totals.calories + food.calories,
    protein: totals.protein + food.protein,
    carbs: totals.carbs + food.carbs,
    fats: totals.fats + food.fats,
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const handleSaveToLibrary = async () => {
    try {
      const id = localStorage.getItem("id");
      if(!id){
        console.error("No Coach ID!");
      }
    
      const res = await fetch("/api/savedMeals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coachId: id,
          mealName,
          foods,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save meal");
      }

      const data = await res.json();
      console.log("Meal saved:", data);
      alert("✅ Meal saved to your library!");
      setIsPopUpMenuOpen(false);
    } catch (error) {
      console.error(error);
      alert("❌ Something happened adding the meal to the library!");
    }
  };


  const handleAddFood = (food: Omit<INutritionFood, 'quantity' | 'unit'>, quantity: number, unit: string) => {
    setFoods((prev) => [
      ...prev,
      {
        ...food,
        quantity,
        unit,
      },
    ]);
  };

  const handleRemoveFood = (index: number) => {
    setFoods((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onSave({
      mealName,
      foods,
      comment: comment || undefined,
    });
    onClose();
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {t("detailsFor")} {meal.mealName}
            </h2>
            <div className='flex flex-row justify-center items-center gap-2'>
              <button 
                className='text-white/90 hover:text-white transition-colors rounded-full hover:bg-white/10 cursor-pointer'
                onClick={() => setIsPopUpMenuOpen(!isPopUpMenuOpen)}
              >
                <Ellipsis/>
              </button>  
              <button
                onClick={onClose}
                className="text-white/90 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          {/* POP UP MENU - OPENED */}
          {isPopUpMenuOpen && 
            <div className='absolute top-10 right-0 rounded-lg bg-white border shadow-md'>
              <div className='flex flex-col text-start'>
                <button 
                  onClick={handleSaveToLibrary}
                  className='cursor-pointer hover:bg-gray-50 py-2 px-3 rounded-lg text-start'
                >
                  {t("saveMeal")}
                </button>
              </div>
            </div>
          }
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            
            {/* Meal Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t("mealName")}</label>
              <input
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                required
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-800 placeholder-gray-400 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>

            {/* Total Macros - Only show if foods exist */}
            {foods.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-2 border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">{t("totalNutrition")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center bg-white rounded-lg p-1 shadow-sm">
                    <div className="text-lg font-bold text-blue-600">{Math.round(totalMacros.calories)}</div>
                    <div className="text-xs font-medium text-gray-600">{t("calories")}</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-1 shadow-sm">
                    <div className="text-lg font-bold text-green-600">{Math.round(totalMacros.protein)}g</div>
                    <div className="text-xs font-medium text-gray-600">{t("protein")}</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-1 shadow-sm">
                    <div className="text-lg font-bold text-yellow-600">{Math.round(totalMacros.carbs)}g</div>
                    <div className="text-xs font-medium text-gray-600">{t("carbs")}</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-1 shadow-sm">
                    <div className="text-lg font-bold text-purple-600">{Math.round(totalMacros.fats)}g</div>
                    <div className="text-xs font-medium text-gray-600">{t("fats")}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Foods Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">{t("foods")}</label>
              {foods.length > 0 ? (
                <div className="space-y-3">
                  <div className="max-h-64 overflow-y-auto space-y-3 border border-slate-200 rounded-xl p-1">
                    {foods.map((food, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 mb-1">
                              {food.quantity}({food.unit}) - {food.name} 
                            </p>
                            <p className='text-sm text-gray-600'>
                              C: {Math.round(food.calories)}kcal, P: {Math.round(food.protein)}g, Ca: {Math.round(food.carbs)}g, F: {Math.round(food.fats)}g
                            </p>
                          </div>
                          <button
                            type='button'
                            onClick={() => handleRemoveFood(index)}
                            className='p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors'
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='flex gap-3'>
                    <button
                        type="button"
                        onClick={() => setIsFoodSearchOpen(true)}
                        className="flex-1 rounded-xl bg-blue-500 px-4 py-3 text-white font-medium hover:bg-blue-600 transition-colors"
                    >
                        {t("searchFoods")}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsCustomFoodOpen(true)}
                        className="flex-1 rounded-xl bg-green-500 px-4 py-3 text-white font-medium hover:bg-green-600 transition-colors"
                    >
                        {t("addYourOwn")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 font-medium mb-3">{t("noFoodAdded")}</p>
                  <div className='flex gap-3'>
                    <button
                        type="button"
                        onClick={() => setIsFoodSearchOpen(true)}
                        className="flex-1 rounded-xl bg-blue-500 px-4 py-3 text-white font-medium hover:bg-blue-600 transition-colors"
                    >
                        {t("searchFoods")}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsCustomFoodOpen(true)}
                        className="flex-1 rounded-xl bg-green-500 px-4 py-3 text-white font-medium hover:bg-green-600 transition-colors"
                    >
                        {t("addYourOwn")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t("comment")}</label>
              <textarea
                value={comment}
                onChange={(e) => {setComment(e.target.value)}}
                placeholder="e.g., High protein meal"
                rows={4}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-800 placeholder-gray-400 resize-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
          </div>
        </div>

         {/* Action Buttons */}
          <div className="flex justify-between p-2 border-t border-slate-300 shadow-[0_-1px_5px_rgba(0,0,0,0.25)] rounded-xl">
            <button
              type="button"
              onClick={onDelete}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-red-50 px-6 py-3 text-red-600 font-semibold hover:bg-red-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {t("delete")}
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl cursor-pointer bg-gray-100 px-6 py-3 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-white font-semibold hover:shadow-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t("accept")}
              </button>
            </div>
          </div>
      </div>

      <FoodSearchModal
        isOpen={isFoodSearchOpen}
        onClose={() => setIsFoodSearchOpen(false)}
        onSelectFood={handleAddFood}
      />
      <AddCustomFoodModal
        isOpen={isCustomFoodOpen}
        onClose={() => setIsCustomFoodOpen(false)}
        onAddCustomFood={handleAddFood}
      />
    </div>
  );
};

export default ViewMealDetails;