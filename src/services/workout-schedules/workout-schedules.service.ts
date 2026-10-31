import { api } from '@/lib/api'
import type { DayOfWeek, StudentWorkoutWeek, WorkoutSchedule } from '@/types/workout-plan.types'

function toCivilDate(value?: string | Date) {
  if (!value) {
    const now = new Date()
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-')
  }
  if (value instanceof Date) {
    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, '0'),
      String(value.getDate()).padStart(2, '0'),
    ].join('-')
  }
  return value.slice(0, 10)
}

export interface CreateScheduleDto {
  studentId: string
  workoutPlanId: string
  dayOfWeek: DayOfWeek
}

export const workoutSchedulesService = {
  async listForStudent(studentId: string): Promise<WorkoutSchedule[]> {
    const { data } = await api.get<WorkoutSchedule[]>('/workout-schedules', {
      params: { studentId },
    })
    return data
  },

  async listMine(): Promise<WorkoutSchedule[]> {
    const { data } = await api.get<WorkoutSchedule[]>('/workout-schedules/mine')
    return data
  },

  async getMyWeek(date?: string | Date): Promise<StudentWorkoutWeek> {
    const { data } = await api.get<StudentWorkoutWeek>('/workout-schedules/mine/week', {
      params: { date: toCivilDate(date) },
    })
    return data
  },

  async create(dto: CreateScheduleDto): Promise<WorkoutSchedule> {
    const { data } = await api.post<WorkoutSchedule>('/workout-schedules', dto)
    return data
  },

  async update(id: string, dto: Partial<CreateScheduleDto>): Promise<WorkoutSchedule> {
    const { data } = await api.put<WorkoutSchedule>(`/workout-schedules/${id}`, dto)
    return data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/workout-schedules/${id}`)
  },
}
