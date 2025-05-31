//WORKOUTS SCHEMA WITH INTERFACE

import { Schema, Types, model, models } from 'mongoose';

// Workout interface
export interface IWorkout {
  name: string; // e.g., "Bench Press"
  sets: number; // e.g., 3
  reps: number; // e.g., 12
  targetWeight: number; // e.g., 135 (in pounds or kg)
  comment?: string; // e.g., "Focus on form"
}

// Daily Workout Schedule interface
export interface IDailyWorkout {
  weekDay: string; // e.g., "Monday"
  workouts: IWorkout[];
}

// Define the Workout Schedule interface
export interface IWorkoutSchedule {
  client: Types.ObjectId; // Reference to Client _id
  coach?: Types.ObjectId; // Reference to Coach _id (optional)
  schedule: IDailyWorkout[]; // Array of daily schedules
  createdAt?: Date;
  updatedAt?: Date;
}

const WorkoutSchema = new Schema<IWorkoutSchedule>(
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
        workouts: [
          {
            name: { type: String, required: true },
            sets: { type: Number, required: true },
            reps: { type: Number, required: true },
            targetWeight: { type: Number, required: true },
            comment: { type: String },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

// "workoutSchedule":[
//   {"weekDay":"Wednesday",
//     "workouts":[
//       {"name":"Tricep Pushdown on Cable",
//         "reps":0,"sets":0,"targetWeight":0},
//         {"name":"Elliptical","reps":0,"sets":0,"targetWeight":0},
//         {"name":"Suspended crossess","reps":0,"sets":0,"targetWeight":0}
//       ]
//     }
//   ]

const WorkoutSchedule = models.workoutSchedule || model<IWorkoutSchedule>('workoutSchedule', WorkoutSchema);

export default WorkoutSchedule;