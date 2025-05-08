export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number; // in kg
  duration?: number; // in minutes
  notes?: string;
}

export interface Workout {
  id: string;
  userId: string;
  title: string;
  date: string;
  exercises: Exercise[];
  notes?: string;
  createdAt: string;
}

export interface WorkoutFormData {
  title: string;
  date: string;
  exercises: Exercise[];
  notes?: string;
}
