'use client';

import { useState } from 'react';
import FoodSearchModal from './FoodSearchModal';
import AddCustomFoodModal from './AddCustomFoodModal';

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
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Create Meal</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Meal Name</label>
              <input
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder='e.g. Breakfast, Heavy Dinner, Pre-Workout Snack'
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Foods</label>
              {foods.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {foods.map((food, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm">
                          {food.quantity} ({food.unit}) - {food.name} 
                        </p>
                        <p className='text-xs text-gray-600'>
                          (C: {Math.round(food.calories)} kcal, P: {Math.round(food.protein)}g, Ca: {Math.round(food.carbs)}g, F: {Math.round(food.fats)}g)
                        </p>
                      </div>
                      
                        
                      <button
                        type='button'
                        onClick={() => handleRemoveFood(index)}
                        className='text-red-600 font-bold text-lg hover:text-red-700 cursor-pointer'
                      >
                        ✕
                      </button>
                    </div>
                    
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No foods added yet.</p>
              )}
              <div className='flex gap-3'>
                <button
                  type="button"
                  onClick={() => setIsFoodSearchOpen(true)}
                  className="mt-2 rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 cursor-pointer"
                >
                  Search Foods
                </button>
                <button
                    type="button"
                    onClick={() => setIsCustomFoodOpen(true)}
                    className="mt-2 rounded-md bg-green-500 px-3 py-1 text-white hover:bg-green-600 cursor-pointer"
                >
                    Add Your Own
                </button>
              </div>
              
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g., High protein meal"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleClosing}
                className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Create Meal
              </button>
            </div>
          </form>
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
    </>
  );
};

export default AddMealModal;