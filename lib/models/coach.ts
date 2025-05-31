import { Schema, model, models, Types } from 'mongoose';
import bcrypt from 'bcrypt';

// Define the coach interface
export interface ICoach {
  name: string;
  email: string;
  password: string;
  phone: string;
  plans: string[];
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
    plans: [{ type: String }],
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