import { api } from '@/lib/api'
import type { StudentProfile } from '@/types/student.types'

export interface CreateStudentDto {
  username?: string
  password: string
  name: string
  email?: string
  phone?: string
  birthDate?: string
  sex?: string
  height?: number
  objective?: string
  experienceLevel?: string
  restrictions?: string
  observations?: string
}

export type UpdateStudentDto = Partial<Omit<CreateStudentDto, 'username' | 'password'>>

export const studentsService = {
  async list(): Promise<StudentProfile[]> {
    const { data } = await api.get<StudentProfile[]>('/students')
    return data
  },

  async get(id: string): Promise<StudentProfile> {
    const { data } = await api.get<StudentProfile>(`/students/${id}`)
    return data
  },

  async create(dto: CreateStudentDto): Promise<StudentProfile> {
    const { data } = await api.post<StudentProfile>('/students', dto)
    return data
  },

  async update(id: string, dto: UpdateStudentDto): Promise<StudentProfile> {
    const { data } = await api.put<StudentProfile>(`/students/${id}`, dto)
    return data
  },

  async updateStatus(
    id: string,
    status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED',
  ): Promise<{ id: string; status: string }> {
    const { data } = await api.put(`/students/${id}/status`, { status })
    return data
  },

  async resetPassword(id: string, newPassword: string): Promise<void> {
    await api.put(`/students/${id}/reset-password`, { newPassword })
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/students/${id}`)
  },
}
