import {TaskStatus, type Task } from "../types/task";
import apiBack from "../api/apiBack";

const STORAGE_KEY = "@tasks_v2";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

// Fallback logic using localStorage to guarantee features work perfectly until backend is officially synced
const loadLocal = (): Task[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLocal = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const taskService = {
  async getTasks(): Promise<Task[]> {
    try {
      // Try to fetch from backend (assuming endpoint /private/tasks/v2 exists mapping this structure)
      const { data } = await apiBack.get("/private/tasks", { headers: getHeaders() });
      return data;
    } catch {
      return loadLocal();
    }
  },

  async createTask(payload: Partial<Task>): Promise<Task> {
    try {
      const { data } = await apiBack.post("/private/tasks/v2", payload, { headers: getHeaders() });
      return data;
    } catch {
      const tasks = loadLocal();
      const newTask: Task = {
        ...payload,
        id: String(Date.now()),
        status: payload.status || TaskStatus.PENDING,
        urgent: payload.urgent || false,
        type: payload.type || "GERAL",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Task;
      tasks.unshift(newTask);
      saveLocal(tasks);
      return newTask;
    }
  },

  async updateTask(id: string, payload: Partial<Task>): Promise<Task> {
    try {
      const { data } = await apiBack.put(`/private/tasks/v2/${id}`, payload, { headers: getHeaders() });
      return data;
    } catch {
      const tasks = loadLocal();
      const idx = tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        tasks[idx] = { ...tasks[idx], ...payload, updatedAt: new Date().toISOString() };
        saveLocal(tasks);
        return tasks[idx];
      }
      throw new Error("Task not found locally");
    }
  },

  async deleteTask(id: string): Promise<void> {
    try {
      await apiBack.delete(`/private/tasks/v2/${id}`, { headers: getHeaders() });
    } catch {
      const tasks = loadLocal();
      saveLocal(tasks.filter(t => t.id !== id));
    }
  },

  async searchTasks(query: string, filterStatus?: string, filterType?: string, filterUrgency?: boolean): Promise<Task[]> {
    const tasks = await this.getTasks();
    return tasks.filter(t => {
      if (filterStatus && t.status !== filterStatus) return false;
      if (filterType && t.type !== filterType) return false;
      if (filterUrgency !== undefined && t.urgent !== filterUrgency) return false;
      
      if (query) {
        const q = query.toLowerCase();
        const matchTitle = t.name.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      
      return true;
    });
  }
};
