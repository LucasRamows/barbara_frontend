import apiBack from "../api/apiBack";
import type { Investment } from "../types/financial";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

// Fallback in-memory state in case backend isn't ready
let localInvestments: Investment[] = [];

export const investmentService = {
  async getInvestments(): Promise<Investment[]> {
    try {
      const { data } = await apiBack.get("/private/investments", {
        headers: getHeaders(),
      });
      return data;
    } catch {
      return localInvestments;
    }
  },

  async createInvestment(payload: Partial<Investment>): Promise<Investment> {
    try {
      const { data } = await apiBack.post("/private/investments", payload, {
        headers: getHeaders(),
      });
      return data;
    } catch {
      const newInv = {
        ...payload,
        id: String(Date.now()),
        createdAt: new Date().toISOString()
      } as Investment;
      localInvestments.push(newInv);
       return newInv;
    }
  },

  async deleteInvestment(id: string) {
    try {
      const { data } = await apiBack.delete(`/private/investments/${id}`, {
        headers: getHeaders(),
      });
      return data;
    } catch {
       localInvestments = localInvestments.filter(i => i.id !== id);
       return;
    }
  }
};
