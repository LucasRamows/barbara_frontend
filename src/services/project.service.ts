import apiBack from "../api/apiBack";
import type { FinancialGoal } from "../types/financial";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const projectService = {
  async getProjects(): Promise<FinancialGoal[]> {
    const { data } = await apiBack.get("/private/goals", {
      headers: getHeaders(),
    }).catch(() => ({ data: [] }));
    return data;
  },

  async createProject(payload: Partial<FinancialGoal>): Promise<FinancialGoal> {
    const { data } = await apiBack.post("/private/goals", payload, {
      headers: getHeaders(),
    });
    return data;
  },

  async fundProject(id: string, value: number) {
    const { data } = await apiBack.put(
      `/private/goals/${id}/add`,
      { value },
      { headers: getHeaders() }
    );
    return data;
  },

  async deleteProject(id: string) {
    const { data } = await apiBack.delete(`/private/goals/${id}`, {
      headers: getHeaders(),
    });
    return data;
  }
};
