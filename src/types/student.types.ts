export interface StudentProfile {
  id: string
  name: string
  email?: string
  phone?: string
  birthDate?: string
  sex?: string
  avatarUrl?: string
  height?: number
  objective?: string
  experienceLevel?: string
  restrictions?: string
  observations?: string
  startDate: string
  createdAt: string
  user: {
    id: string
    username: string
    status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
    mustChangePassword: boolean
  }
}
