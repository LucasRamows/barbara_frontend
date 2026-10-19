import { api } from '@/lib/api'
import type { DayOfWeek, WorkoutSchedule } from '@/types/workout-plan.types'

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
