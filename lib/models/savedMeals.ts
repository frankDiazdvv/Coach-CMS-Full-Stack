import { Schema, model, models, Types } from 'mongoose';
import { INutritionFood } from './nutrition';

export interface ISavedMeal {
  coachId: Types.ObjectId;
  mealName: string;
  foods: INutritionFood[];
  createdAt?: Date;
  updatedAt?: Date;
  _id: Types.ObjectId;

}

const SavedMealSchema = new Schema<ISavedMeal>(
  {
    coachId: { type: Schema.Types.ObjectId, ref: 'coach', required: true },
    mealName: { type: String, required: true },
    foods: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            unit: { type: String, required: true },
            calories: { type: Number, required: true },
            protein: { type: Number, required: true },
            carbs: { type: Number, required: true },
            fats: { type: Number, required: true },
        },
    ],
  },
  { timestamps: true }
);

const SavedMeal = models.savedMeal || model<ISavedMeal>('savedMeal', SavedMealSchema);

export default SavedMeal;