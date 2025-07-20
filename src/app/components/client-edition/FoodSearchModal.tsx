'use client';

import { useState } from 'react';

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFood: (
    food: {
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    },
    quantity: number,
    unit: string
  ) => void;
}

const FoodSearchModal: React.FC<FoodSearchModalProps> = ({ isOpen, onClose, onSelectFood }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>('g'); // grams
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const API_KEY = 'JcaHk6y5uiwKlPLBt1hietUxOn2yb6JgbEZNhHcn';

  const handleSearch = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${API_KEY}&query=${encodeURIComponent(
          searchQuery
        )}&dataType=Foundation,Survey (FNDDS)&pageSize=200`
      );
      if (!response.ok) throw new Error('Failed to fetch foods');
      const data = await response.json();
      setFoods(data.foods || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to Load Foods";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMacros = (food: { foodNutrients: any; }) => {
    const nutrients = food.foodNutrients;
    const calories = nutrients.find((n: { nutrientId: number; }) => n.nutrientId === 1008 || n.nutrientId === 2047)?.value || 0;
    const protein = nutrients.find((n: { nutrientName: string; }) => n.nutrientName === 'Protein')?.value || 0;
    const carbs = nutrients.find((n: { nutrientName: string; }) => n.nutrientName === 'Carbohydrate, by difference')?.value || 0;
    const fats = nutrients.find((n: { nutrientName: string; }) => n.nutrientName === 'Total lipid (fat)')?.value || 0;    
    return { calories, protein, carbs, fats };
  };

  const handleSelect = () => {
    if (selectedFood) {
      const macros = calculateMacros(selectedFood);
      let scaleFactor = quantity; // Default for per-item measures

      if (unit === 'g') {
        //scale by quantity / 100 since macros are per 100g
        scaleFactor = quantity / 100;
      } else if (unit === 'ml') {
        // assume 1ml = 1g for simplicity
        scaleFactor = quantity / 100;
      } else if (unit === 'oz') {
        // scale by Ounces
        scaleFactor = quantity / 3.53;
      } else {
        // If unit is a foodMeasure (e.g., "1 egg"), find the gram weight and scale accordingly
        const selectedMeasure = selectedFood.foodMeasures.find(
          (measure: any) => measure.disseminationText === unit
        );
        if (selectedMeasure) {
          const gramWeight = selectedMeasure.gramWeight;
          scaleFactor = (quantity * gramWeight) / 100; // Scale by (quantity * weight per item) / 100
        }
      }

      onSelectFood(
        {
          name: selectedFood.description,
          calories: parseFloat((macros.calories * scaleFactor).toFixed(2)),
          protein: parseFloat((macros.protein * scaleFactor).toFixed(2)),
          carbs: parseFloat((macros.carbs * scaleFactor).toFixed(2)),
          fats: parseFloat((macros.fats * scaleFactor).toFixed(2)),
        },
        quantity,
        unit
      );
      setSearchQuery('');
      setFoods([]);
      setSelectedFood(null);
      setQuantity(1);
      setUnit('g'); // Reset to grams
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Search Food</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search foods (e.g., Banana)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="mt-2 rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
          >
            Search
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : foods.length === 0 ? (
            <p className="text-gray-500">No foods found</p>
          ) : (
            foods.map((food) => {
              const calories = food.foodNutrients.find(
                (nutrient: any) => nutrient.nutrientId === 1008 || nutrient.nutrientId === 2047
              )?.value || 0;
              return (
                <div
                  key={food.fdcId}
                  onClick={() => setSelectedFood(food)}
                  className={`cursor-pointer rounded-md p-2 hover:bg-gray-100 ${
                    selectedFood?.fdcId === food.fdcId ? 'bg-gray-200' : ''
                  }`}
                >
                  <p className="text-sm">{food.description}</p>
                  <p className="text-xs text-gray-500">{food.foodCategory}, {calories}kcal/100g</p>
                </div>
              );
            })
          )}
        </div>
        {selectedFood && (
          <div className="mt-4">
            <div className="flex space-x-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="1"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="g">grams (g)</option>
                  <option value="ml">milliliters (ml)</option>
                  <option value="oz">ounces (oz)</option>
                  {selectedFood.foodMeasures && selectedFood.foodMeasures.length > 0 && (
                    selectedFood.foodMeasures.map((measure: any) => (
                      <option key={measure.id} value={measure.disseminationText}>
                        {measure.disseminationText} ({measure.gramWeight}g)
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedFood}
            className={`rounded-md px-4 py-2 text-white ${
              selectedFood ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Add Food
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodSearchModal;