import { useEffect, useState } from "react";
import type {
  DayOfWeek,
  Exercise,
  ExerciseOnDay,
  WorkoutDay,
} from "../../../types/workout";
import { workoutService } from "../services/workout.service";

export const useWorkout = () => {
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [planId, setPlanId] = useState<string | null>(null);
  const [globalExercises, setGlobalExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const plans = await workoutService.getPlans();
      const exercises = await workoutService.getExercises();

      setGlobalExercises(exercises);

      if (plans.length > 0) {
        const plan = plans[0];
        setPlanId(plan.id);
        const mappedDays: WorkoutDay[] = plan.days.map((d: any) => ({
          id: d.id,
          day: d.day,
          label: d.label,
          exercises: d.exercises.map((ex: any) => ({
            id: ex.id,
            order: ex.order,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            restTime: ex.restTime,
            exercise: {
              id: ex.exercise.id,
              name: ex.exercise.name,
              targetMuscle: ex.exercise.targetMuscle,
            },
          })),
        }));
        setWorkoutDays(mappedDays);
      }
    } catch (err) {
      console.error("Error loading workout data", err);
    } finally {
      setLoading(false);
    }
  };

  const addDay = async (day: DayOfWeek, label: string | null) => {
    if (!planId) return;
    try {
      const newDay = await workoutService.createDay(planId, { day, label });
      setWorkoutDays((prev) => [...prev, { ...newDay, exercises: [] }]);
    } catch (err) {
      console.error("Error adding day", err);
    }
  };

  const saveExercise = async (
    currentDayId: string,
    payload: {
      exerciseId: string;
      order: number;
      sets: number;
      reps: string;
      weight: number | null;
      restTime: number | null;
    },
    editingExercise?: ExerciseOnDay,
  ) => {
    const selectedExercise = globalExercises.find(
      (ex) => ex.id === payload.exerciseId,
    );
    if (!selectedExercise) return;

    try {
      let data: any;
      if (editingExercise) {
        data = await workoutService.updateExerciseOnDay(
          editingExercise.id,
          payload,
        );
      } else {
        data = await workoutService.createExerciseOnDay(currentDayId, payload);
      }

      setWorkoutDays((prev) =>
        prev.map((day) => {
          if (day.id !== currentDayId) return day;

          if (editingExercise) {
            return {
              ...day,
              exercises: day.exercises.map((ex) =>
                ex.id === editingExercise.id
                  ? { ...ex, ...data, exercise: selectedExercise }
                  : ex,
              ),
            };
          }

          return {
            ...day,
            exercises: [
              ...day.exercises,
              { ...data, exercise: selectedExercise },
            ],
          };
        }),
      );
    } catch (err) {
      console.error("Error saving exercise", err);
    }
  };

  const deleteExercise = async (currentDayId: string, exerciseId: string) => {
    try {
      await workoutService.deleteExercise(exerciseId);
      setWorkoutDays((prev) =>
        prev.map((day) => {
          if (day.id !== currentDayId) return day;
          return {
            ...day,
            exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
          };
        }),
      );
    } catch (err) {
      console.error("Error deleting exercise", err);
    }
  };

  return {
    workoutDays,
    planId,
    globalExercises,
    loading,
    addDay,
    saveExercise,
    deleteExercise,
    refreshParams: loadData,
  };
};
