export interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
}

export interface WorkoutLog {
  _id: string;
  client: Client;
  workoutSchedule: string; // ObjectId as string
  day: string;
  loggedAt: Date;
  comment?: string;
}