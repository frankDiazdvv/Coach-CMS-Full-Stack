'use client';

import { useState } from 'react';

interface AddCustomFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomFood: (
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

const AddCustomFoodModal: React.FC<AddCustomFoodModalProps> = ({ isOpen, onClose, onAddCustomFood }) => {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fats, setFats] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>('items');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCustomFood(
      {
        name,
        calories: calories,
        protein: protein,
        carbs: carbs,
        fats: fats,
      },
      quantity,
      unit
    );
    setName('');
    setCalories(0);
    setProtein(0);
    setCarbs(0);
    setFats(0);
    setQuantity(1);
    setUnit('items');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Add Custom Food</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Food Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g. Ground Beef'
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Calories (kcal per serving)</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              required
              min="0"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Protein (g per serving)</label>
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(Number(e.target.value))}
              required
              min="0"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Carbs (g per serving)</label>
            <input
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(Number(e.target.value))}
              required
              min="0"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fats (g per serving)</label>
            <input
              type="number"
              value={fats}
              onChange={(e) => setFats(Number(e.target.value))}
              required
              min="0"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
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
                <option value="items">units</option>
                <option value="g">grams (g)</option>
                <option value="ml">milliliters (ml)</option>
                <option value="oz">ounces (oz)</option>
                <option value="slices">slices</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Add Custom Food
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomFoodModal;