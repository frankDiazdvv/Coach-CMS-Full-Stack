import { Schema, model, models, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { ICoach } from './coach';
import { IWorkoutSchedule } from './workouts';

export interface IClient {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
  goal: string;
  currentWeight: string;
  targetWeight: string;
  planAssigned: string;
  planExpires?: Date;
  workoutSchedule?: Types.ObjectId | IWorkoutSchedule;
  nutritionSchedule?: Types.ObjectId;
  coach: Types.ObjectId | ICoach;
  imageUrl?: string;
  resetToken?: string;
  resetTokenExpiry?: number;
  createdAt?: Date;
  updatedAt?: Date;
  _id?: Types.ObjectId;
}

const ClientSchema = new Schema<IClient>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    gender: { type: String, required: true },
    goal: { type: String, required: true },
    currentWeight: { type: String, required: true },
    targetWeight: { type: String, required: false },
    imageUrl: { type: String, required: false },
    resetToken: { type: String, required: false },
    resetTokenExpiry: { type: Number, required: false },
    planAssigned: { type: String, required: false },
    planExpires: { type: Date, required: false },
    workoutSchedule: { type: Schema.Types.ObjectId, ref: 'workoutSchedule', required: false },
    nutritionSchedule: { type: Schema.Types.ObjectId, ref: 'nutritionSchedule', required: false },
    coach: {
      type: Schema.Types.ObjectId,
      ref: 'coach',
      required: true,
      validate: {
        validator: async (value: string) => {
          const coach = await models.coach.findById(value);
          return !!coach;
        },
        message: 'Coach does not exist',
      },
    },
  },
  { timestamps: true }
);

ClientSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const Client = models.client || model<IClient>('client', ClientSchema);

export default Client;