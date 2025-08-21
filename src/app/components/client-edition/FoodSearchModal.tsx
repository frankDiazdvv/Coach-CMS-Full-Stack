'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { IoSearch } from 'react-icons/io5';
import { useLocale } from 'next-intl';
import Fuse from 'fuse.js';
import ingredients from '../../../../lib/ingredients_local_db/ingredients.json';

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
  const [allFoods, setAllFoods] = useState<any[]>([]); // Store all foods for filtering
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>('g'); // grams
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslations();
  const locale = useLocale();

  const API_KEY = 'JcaHk6y5uiwKlPLBt1hietUxOn2yb6JgbEZNhHcn';
  const noImage = '/no-image-icon.png';

  const filterIngredients = (results: any[]) => {
    return results.filter(
      (item) =>
        item.nutriments &&
        item.nutriments['energy-kcal_100g'] > 0
    );
  };

  // Load foods when modal opens
  useEffect(() => {
    if (!isOpen) {
      setFoods([]);
      setAllFoods([]);
      setSearchQuery('');
      setSelectedFood(null);
      setQuantity(1);
      setUnit('g');
      return;
    }

    const loadFoods = async () => {
      setIsLoading(true);
      setError('');

      try {
        let data: any[] = [];

          // if (locale === 'en') {
          // // Fetch from USDA
          // const response = await fetch(
          //   `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${API_KEY}&query=&dataType=Foundation,Survey (FNDDS)&pageSize=2000`
          // );
          // if (!response.ok) throw new Error('Failed to fetch foods (USDA)');
          // const result = await response.json();
          // data = result.foods || [];
          // }
          data = ingredients.foods;

        setAllFoods(data);
        setFoods(data); // Initially display all foods
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to Load Foods';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadFoods();
  }, [isOpen, locale]);

  // Filter foods as searchQuery changes
  useEffect(() => {
    if (!searchQuery) {
      setFoods(allFoods); // Show all foods when query is empty
      return;
    }

    if (locale === 'en') {
      // Fuse.js for english search
      const fuse = new Fuse(allFoods, {
        keys: ['en_product_name', 'category.en'],
        threshold: 0.3,
      });
      const results = fuse.search(searchQuery).map((result) => result.item);
      setFoods(results);
    } else {
      // Fuse.js for Spanish search
      const fuse = new Fuse(allFoods, {
        keys: ['es_product_name', 'category.es'],
        threshold: 0.3, // 0 = exact, 1 = very loose
      });
      const results = fuse.search(searchQuery).map((result) => result.item);
      const filteredResults = filterIngredients(results);
      setFoods(filteredResults);
    }
  }, [searchQuery, allFoods, locale]);

  const calculateMacros = (food: any) => {
      const n = food.nutriments || {};
      const calories = n['energy-kcal_100g'] || 0;
      const protein = n['proteins_100g'] || 0;
      const carbs = n['carbohydrates_100g'] || 0;
      const fats = n['fat_100g'] || 0;
      return { calories, protein, carbs, fats };
  };

  const handleSelect = () => {
    if (selectedFood) {
      const macros = calculateMacros(selectedFood);
      let scaleFactor = quantity;

      if (unit === 'g') {
        scaleFactor = quantity / 100;
      } else if (unit === 'ml') {
        scaleFactor = quantity / 100;
      } else if (unit === 'oz') {
        scaleFactor = quantity / 3.53;
      } else {
        const selectedMeasure = selectedFood.foodMeasures?.find((measure: any) => locale === "en" ? measure.en_disseminationText === unit : measure.es_disseminationText === unit);
        if (selectedMeasure) {
          const gramWeight = selectedMeasure.gramWeight;
          scaleFactor = (quantity * gramWeight) / 100;
        }
      }

      onSelectFood(
        {
          name: locale === 'en' ? selectedFood.en_product_name : selectedFood.es_product_name,
          calories: parseFloat((macros.calories * scaleFactor).toFixed(2)),
          protein: parseFloat((macros.protein * scaleFactor).toFixed(2)),
          carbs: parseFloat((macros.carbs * scaleFactor).toFixed(2)),
          fats: parseFloat((macros.fats * scaleFactor).toFixed(2)),
        },
        quantity,
        unit
      );

      setSearchQuery('');
      setFoods(allFoods);
      setSelectedFood(null);
      setQuantity(1);
      setUnit('g');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-semibold text-gray-800 cursor-default">{t('searchFoods')}</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder={t('searchFoodPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-300 hover:border-black px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : foods.length === 0 ? (
            <p className="text-gray-500">{t('noFoodsFound')}</p>
          ) : (
            foods.map((food) => {
              const id = food.id;
              const name = locale === 'en' ? food.en_product_name : food.es_product_name;
              const calories = food.nutriments?.['energy-kcal_100g'] || 0;
              const categories = locale === 'en' ? food.category?.en : food.category?.es || '';
              const foodImage = food.image_front_small_url || '';

              return (
                <div
                  key={id}
                  onClick={() => setSelectedFood(food)}
                  className={`cursor-pointer flex flex-row rounded-md p-2 hover:bg-gray-100 ${
                    (selectedFood?.id) === id ? 'bg-gray-200' : ''
                  }`}
                >
                  <div className="flex flex-col justify-center">

                    <p className="text-sm font-semibold">{name} <span className='font-normal text-gray-600'> - {categories}</span></p>
                    <p className="text-xs text-gray-500">{calories} kcal/100g</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {selectedFood && (
          <div className="mt-4">
            <div className="flex space-x-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('quantity')}</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="1"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('unit')}</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="g">{t('grams')} (g)</option>
                  <option value="ml">{t('milliliters')} (ml)</option>
                  <option value="oz">{t('ounces')} (oz)</option>
                  {selectedFood.foodMeasures?.map((measure: any) => (
                    <option key={measure.measureId} value={locale === "en" ? measure.en_disseminationText : measure.es_disseminationText}>
                      {locale === "en" ? measure.en_disseminationText : measure.es_disseminationText} ({measure.gramWeight}g)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedFood}
            className={`rounded-md px-4 py-2 text-white ${
              selectedFood ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {t('addFood')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodSearchModal;