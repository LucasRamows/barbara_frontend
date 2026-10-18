export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
}

export interface ExerciseOnDay {
  id: string;
  order: number;
  sets: number;
  reps: string;
  weight: number | null;
  restTime: number | null;
  exercise: Exercise;
}

export interface WorkoutDay {
  id: string;
  day: DayOfWeek;
  label: string | null;
  exercises: ExerciseOnDay[];
}

export interface WorkoutPlan {
  id: string;
  days: WorkoutDay[];
}
