import { Schema, model, models, Types } from 'mongoose';

export interface ISavedWorkout {
  coachId: Types.ObjectId;
  name: string;
  imageUrl?: string[]; // Cloudflare public URL
  objectKey?: string; // Cloudflare R2 object key for deletion
  workoutUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const SavedWorkoutSchema = new Schema<ISavedWorkout>(
  {
    coachId: { type: Schema.Types.ObjectId, ref: 'coach', required: true },
    name: { type: String, required: true },
    imageUrl: [{ type: String, required: false }],
    objectKey: { type: String, required: false },
    workoutUrl: { type: String, required: false }
  },
  { timestamps: true }
);

const SavedWorkout = models.savedWorkout || model<ISavedWorkout>('savedWorkout', SavedWorkoutSchema);

export default SavedWorkout;
