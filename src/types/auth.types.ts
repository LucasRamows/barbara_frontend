export type Role = 'SUPER_ADMIN' | 'PERSONAL' | 'ALUNO'

export interface AuthUser {
  id: string
  role: Role
  name: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}
