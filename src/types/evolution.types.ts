export type PhotoPosition = 'FRONT' | 'BACK' | 'LEFT' | 'RIGHT' | 'OTHER'

export interface BodyMeasurement {
  id: string
  studentId: string
  date: string
  weight: number | null
  height: number | null
  bodyFat: number | null
  chest: number | null
  waist: number | null
  hips: number | null
  thigh: number | null
  arm: number | null
  neck: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface ProgressPhoto {
  id: string
  studentId: string
  date: string
  position: PhotoPosition
  notes: string | null
  signedUrl: string
  createdAt: string
}
