export enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  deadline?: string;
  urgent: boolean;
  status: TaskStatus;
  type: string; // used for grouping logically
  color?: string; // global CSS token e.g., "primary", "destructive", "accent"
  relatedTaskId?: string | null;
  createdAt: string;
  updatedAt: string;
}
