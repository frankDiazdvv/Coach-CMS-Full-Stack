'use client';

import { useTranslations } from 'next-intl';
import { FormEvent, useState } from 'react';
import { IoSearch } from "react-icons/io5";
import { useLocale } from 'next-intl';
import ingredientsES from '../../../../lib/ingredients_local_db/ingredientsES.json';


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
  const t = useTranslations();
  const locale = useLocale();

  const API_KEY = 'JcaHk6y5uiwKlPLBt1hietUxOn2yb6JgbEZNhHcn';
  const noImage = '/no-image-icon.png';

  const filterIngredients = (results: any[]) => {
    return results.filter(item => 
      item.nutriments && item.nutriments["energy-kcal_100g"] > 0 &&
      !(item.categories_tags || []).some((tag: string) => 
        ["en:beverages", "en:snacks", "en:sodas", "en:prepared-meals"].includes(tag)
      )
    );
  };

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let data;

      if (locale === "en") {
        // USDA
        const response = await fetch(
          `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${API_KEY}&query=${encodeURIComponent(
            searchQuery
          )}&dataType=Foundation,Survey (FNDDS)&pageSize=50`
        );
        if (!response.ok) throw new Error("Failed to fetch foods (USDA)");
        data = await response.json();
        console.log(data);
        setFoods(data.foods || []);

      } else {

        // Spanish -> OFF
        const response = await fetch(
          // https://world.openfoodfacts.org/cgi/search.pl?search_terms=manzana&search_simple=1&json=1&tagtype_0=brands&tag_contains_0=without
          `https://es.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
            searchQuery
          )}&search_simple=1&action=process&json=1&page_size=50`
        );
        if (!response.ok) throw new Error("Failed to fetch foods (OFF)");
        data = await response.json();

        const filteredProducts = filterIngredients(data.products || []);

        // Filter local JSON (simple case-insensitive match)
        const localMatches = ingredientsES.filter(item =>
          item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        console.log(data.products);
        setFoods([...localMatches, ...filteredProducts]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to Load Foods";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };


  const calculateMacros = (food: any) => {
  if (locale === "en") {
    // USDA
    const nutrients = food.foodNutrients || [];
    const calories = nutrients.find((n: { nutrientId: number; }) => n.nutrientId === 1008 || n.nutrientId === 2047)?.value || 0;
    const protein = nutrients.find((n: { nutrientName: string; }) => n.nutrientName === "Protein")?.value || 0;
    const carbs = nutrients.find((n: { nutrientName: string; }) => n.nutrientName === "Carbohydrate, by difference")?.value || 0;
    const fats = nutrients.find((n: { nutrientName: string; }) => n.nutrientName === "Total lipid (fat)")?.value || 0;
    return { calories, protein, carbs, fats };
  } else {
    // OFF
    const n = food.nutriments || {};
    const calories = n["energy-kcal_100g"] || 0;
    const protein = n["proteins_100g"] || 0;
    const carbs = n["carbohydrates_100g"] || 0;
    const fats = n["fat_100g"] || 0;
    return { calories, protein, carbs, fats };
  }
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
          name: locale === "en" ? selectedFood.description : selectedFood.product_name,
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
        <h2 className="mb-4 text-2xl font-semibold text-gray-800 cursor-default">{t("searchFoods")}</h2>
        <form onSubmit={handleSearch}>
          <div className="flex flex-row gap-1 mb-4">
            <input
              type="text"
              placeholder={t("searchFoodPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 hover:border-black px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
            <button
              type='submit'
              className="cursor-pointer rounded-md hover:rounded-4xl bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 transition-all duration-400"
            >
              <IoSearch className='text-xl' />
            </button>
          </div>
        </form>
        <div className="max-h-64 overflow-y-auto">
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : foods.length === 0 ? (
            <p className="text-gray-500">{t("noFoodsFound")}</p>
          ) : (
            foods.map((food) => {
              const id = locale === "en" ? food.fdcId : food.id;
              const name = locale === "en" ? food.description : food.product_name;
              const calories =
                locale === "en"
                  ? food.foodNutrients.find(
                      (nutrient: any) =>
                        nutrient.nutrientId === 1008 || nutrient.nutrientId === 2047
                    )?.value || 0
                  : food.nutriments?.["energy-kcal_100g"] || 0;
                const foodImage = locale === "es" ? food.image_front_small_url : '';

              return (
                <div
                  key={id}
                  onClick={() => setSelectedFood(food)}
                  className={`cursor-pointer flex flex-row rounded-md p-2 hover:bg-gray-100 ${
                    (locale === "en" ? selectedFood?.fdcId : selectedFood?.id) === id
                      ? "bg-gray-200"
                      : ""
                  }`}
                >
                  {locale === 'es' && (
                    <div className='object-cover object-center w-10 h-full mr-2'>
                      <img className='h-10 w-auto' src={foodImage || noImage} alt="No se ve ni pinga" />
                    </div>
                  )}
                  <div className='flex flex-col justify-center'>
                    <p className="text-sm">{name}</p>
                    <p className="text-xs text-gray-500">
                      {calories} kcal/100g
                    </p>
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
                <label className="block text-sm font-medium text-gray-700">{t("quantity")}</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="1"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t("unit")}</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="g">{t("grams")} (g)</option>
                  <option value="ml">{t("milliliters")} (ml)</option>
                  <option value="oz">{t("ounces")} (oz)</option>
                  {selectedFood.foodMeasures && selectedFood.foodMeasures.length > 0 && (
                    selectedFood.foodMeasures.map((measure: any) => (
                      <option key={locale === "en" ? measure.id : measure.measureId} value={measure.disseminationText}>
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
            className="cursor-pointer rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedFood}
            className={`rounded-md px-4 py-2 text-white ${
              selectedFood ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {t("addFood")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodSearchModal;