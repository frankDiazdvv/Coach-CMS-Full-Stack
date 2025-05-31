//NUTRITION SCHEMA WITH INTERFACE

import { Schema, Types, model, models } from 'mongoose';

// Define the Nutrition Item interface
export interface INutritionItem {
  food: string; // e.g., "Chicken Breast"
  calories: number; // e.g., 200
  comment?: string; // e.g., "Eat with veggies"
}

// Define the Daily Nutrition Schedule interface
export interface IDailyNutrition {
  weekDay: string; // e.g., "Monday"
  items: INutritionItem[];
}

// Define the Nutrition Schedule interface
export interface INutritionSchedule {
  client: Types.ObjectId; // Reference to Client _id
  coach?: Types.ObjectId; // Reference to Coach _id (optional)
  schedule: IDailyNutrition[]; // Array of daily schedules
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
            food: { type: String, required: true },
            calories: { type: Number, required: true },
            comment: { type: String },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const NutritionSchedule = models.nutritionSchedule || model<INutritionSchedule>('nutritionSchedule', NutritionSchema);

export default NutritionSchedule;