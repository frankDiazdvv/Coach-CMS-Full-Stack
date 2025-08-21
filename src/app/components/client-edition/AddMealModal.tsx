'use client';

import { useState } from 'react';
import FoodSearchModal from './FoodSearchModal';
import AddCustomFoodModal from './AddCustomFoodModal';
import { useTranslations } from 'use-intl';

interface INutritionFood {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMeal: (meal: {
    mealName: string;
    foods: INutritionFood[];
    comment?: string;
  }) => void;
}

const AddMealModal: React.FC<AddMealModalProps> = ({ isOpen, onClose, onSelectMeal }) => {
  const [mealName, setMealName] = useState('');
  const [foods, setFoods] = useState<INutritionFood[]>([]);
  const [comment, setComment] = useState('');
  const [isFoodSearchOpen, setIsFoodSearchOpen] = useState(false);
  const [isCustomFoodOpen, setIsCustomFoodOpen] = useState(false);
  const t = useTranslations();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectMeal({
      mealName,
      foods,
      comment: comment || undefined,
    });
    setMealName('');
    setFoods([]);
    setComment('');
    onClose();
  };

  const handleClosing = () => {
    setMealName('');
    setFoods([]);
    setComment('');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold cursor-default text-white">
              {t("createMeal")}
            </h2>
            <button
              onClick={onClose}
              className="cursor-pointer text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
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
                placeholder={t("mealName")}
                required
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-800 placeholder-gray-400 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>

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
                        className="cursor-pointer flex-1 rounded-xl bg-blue-500 px-4 py-3 text-white font-medium hover:bg-blue-600 transition-colors"
                    >
                        {t("searchFoods")}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsCustomFoodOpen(true)}
                        className="cursor-pointer flex-1 rounded-xl bg-green-500 px-4 py-3 text-white font-medium hover:bg-green-600 transition-colors"
                    >
                        {t("addYourOwn")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center pt-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 font-medium mb-3 cursor-default">{t("noFoodAdded")}</p>
                  <div className='flex gap-2 p-2'>
                    <button
                        type="button"
                        onClick={() => setIsFoodSearchOpen(true)}
                        className="cursor-pointer flex-1 rounded-xl bg-blue-500 px-4 py-3 text-white font-medium hover:bg-blue-600 transition-colors"
                    >
                        {t("searchFoods")}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsCustomFoodOpen(true)}
                        className="cursor-pointer flex-1 rounded-xl bg-green-500 px-4 py-3 text-white font-medium hover:bg-green-600 transition-colors"
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
                placeholder={t("addMealComment")}
                rows={4}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-800 placeholder-gray-400 resize-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
          </div>
        </div>

         {/* Action Buttons */}
          <div className="flex justify-between p-2 border-t border-slate-300 shadow-[0_-1px_5px_rgba(0,0,0,0.25)] rounded-xl">
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

export default AddMealModal;