import { Schema, model, models, Types } from 'mongoose';
import bcrypt from 'bcrypt';

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
  workoutSchedule?: Types.ObjectId;
  nutritionSchedule?: Types.ObjectId;
  coach: Types.ObjectId;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  _id: Types.ObjectId;
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
    planAssigned: {
      type: String,
      required: true,
      validate: {
        validator: async function (value: string) {
          const coach = await models.coach.findById(this.coach);
          return coach && coach.plans.includes(value);
        },
        message: 'Plan must belong to the assigned coach',
      },
    },
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