// lib/models/workoutLogs.ts
import { Schema, model, models, Types } from 'mongoose';

export interface IWorkoutLog {
  client: Types.ObjectId; // Reference to Client
  workoutSchedule: Types.ObjectId; // Reference to WorkoutSchedule
  day: string; // e.g., "Monday"
  loggedAt: Date; // Timestamp of log
  comment?: string; // Optional note from client
}

const WorkoutLogSchema = new Schema<IWorkoutLog>(
  {
    client: { type: Schema.Types.ObjectId, ref: 'client', required: true },
    workoutSchedule: { type: Schema.Types.ObjectId, ref: 'workoutSchedule', required: true },
    day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    loggedAt: { type: Date, default: Date.now },
    comment: { type: String }, // Optional
  },
  { timestamps: true }
);

const WorkoutLog = models.workoutLog || model<IWorkoutLog>('workoutLog', WorkoutLogSchema);

export default WorkoutLog;