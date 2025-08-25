// coach.ts
import { Schema, model, models, Types } from 'mongoose';
import bcrypt from 'bcrypt';

export interface ICoach {
  name: string;
  email: string;
  password: string;
  phone: string;
  plans: string[];
  isSubscribed: boolean;
  clientCount: number; // New field to track client count
  stripeCustomerId?: string; // Optional field for Stripe customer ID
  stripeSubscriptionId: { type: String, required: false },
  planName: string;
  resetToken?: string;
  resetTokenExpiry?: number;
  createdAt?: Date;
  updatedAt?: Date;
  _id?: Types.ObjectId;
}

const CoachSchema = new Schema<ICoach>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    plans: [{ type: String, required: true }],
    isSubscribed: { type: Boolean, default: false },
    clientCount: { type: Number, default: 0 }, // Initialize to 0
    stripeCustomerId: { type: String, required: false },
    stripeSubscriptionId: { type: String, required: false },
    planName: { type: String, default: 'Free' },
    resetToken: { type: String, required: false },
    resetTokenExpiry: { type: Number, required: false },  
  },
  { timestamps: true }
);

CoachSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const Coach = models.coach || model<ICoach>('coach', CoachSchema);

export default Coach;