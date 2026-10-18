import apiBack from "../../../api/apiBack";
import type { Exercise, WorkoutDay, WorkoutPlan } from "../../../types/workout";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const workoutService = {
  getPlans: async (): Promise<WorkoutPlan[]> => {
    const { data } = await apiBack.get("private/plans", { headers: getHeaders() });
    return data;
  },

  getExercises: async (): Promise<Exercise[]> => {
    const { data } = await apiBack.get("private/exercises", { headers: getHeaders() });
    return data;
  },

  createExerciseOnDay: async (
    dayId: string,
    payload: {
      exerciseId: string;
      order: number;
      sets: number;
      reps: string;
      weight: number | null;
      restTime: number | null;
    }
  ): Promise<any> => {
    const { data } = await apiBack.post(`/private/days/${dayId}/exercises`, payload, {
      headers: getHeaders(),
    });
    return data;
  },

  updateExerciseOnDay: async (
    exerciseId: string,
    payload: {
      exerciseId: string;
      order: number;
      sets: number;
      reps: string;
      weight: number | null;
      restTime: number | null;
    }
  ): Promise<any> => {
    const { data } = await apiBack.put(`/private/exercises-on-day/${exerciseId}`, payload, {
      headers: getHeaders(),
    });
    return data;
  },

  deleteExercise: async (id: string): Promise<void> => {
    await apiBack.delete(`/private/exercises-on-day/${id}`, {
      headers: getHeaders(),
    });
  },

  createDay: async (
    planId: string,
    payload: { day: string; label: string | null }
  ): Promise<WorkoutDay> => {
    const { data } = await apiBack.post(`private/plans/${planId}/days`, payload, {
      headers: getHeaders(),
    });
    return data;
  },
};
