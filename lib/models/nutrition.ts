import { Schema, Types, model, models } from 'mongoose';

export interface INutritionFood {
  name: string;
  quantity: number;
  unit: string; // e.g., "items", "g", "ml"
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface INutritionItem {
  mealName: string;
  foods: INutritionFood[];
  comment?: string;
}

export interface INutritionDay {
  weekDay: string;
  items: INutritionItem[];
}

export interface INutritionSchedule {
  client: Types.ObjectId;
  coach?: Types.ObjectId;
  schedule: INutritionDay[];
  notes: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const NutritionSchema = new Schema<INutritionSchedule>(
  {
    client: { type: Schema.Types.ObjectId, ref: 'client', required: true },
    coach: { type: Schema.Types.ObjectId, ref: 'coach', required: false },
    schedule: [
      {
        weekDay: {
          type: String,
          required: true,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
        items: [
          {
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
            comment: { type: String },
          },
        ],
      },
    ],
    notes: {type: String, required: false},
  },
  { timestamps: true }
);

const NutritionSchedule = models.nutritionSchedule || model<INutritionSchedule>('nutritionSchedule', NutritionSchema);

export default NutritionSchedule;