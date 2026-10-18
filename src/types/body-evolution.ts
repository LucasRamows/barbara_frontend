export interface MeasurementRecord {
  id: string;
  month: string; // YYYY-MM or similar
  weight: number;
  chest: number;
  waist: number;
  arms: number;
  legs: number;
  shoulders?: number;
  imageUrl?: string;
  imageAfterUrl?: string; // For comparison
  createdAt: string;
}
