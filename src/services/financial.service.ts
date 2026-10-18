import apiBack from "../api/apiBack";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const financialService = {
  async getTransactions(month: number, year: number) {
    const { data } = await apiBack.get("/private/transactions", {
      params: { month, year },
      headers: getHeaders(),
    });
    return data;
  },

  async getCategories() {
    const { data } = await apiBack.get("/private/categories", {
      headers: getHeaders(),
    });
    return data;
  },

  async createTransaction(payload: any) {
    const { data } = await apiBack.post("/private/transactions", payload, {
      headers: getHeaders(),
    });
    return data;
  },

  async deleteTransaction(id: string) {
    const { data } = await apiBack.delete(`/private/transactions/${id}`, {
      headers: getHeaders(),
    });
    return data;
  },
};
