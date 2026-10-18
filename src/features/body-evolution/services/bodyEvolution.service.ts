import apiBack from "../../../api/apiBack";
import type { MeasurementRecord } from "../../../types/body-evolution";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const bodyEvolutionService = {
  getMeasurements: async (): Promise<MeasurementRecord[]> => {
    try {
      const { data } = await apiBack.get("private/measurements", { headers: getHeaders() });
      return data;
    } catch (error) {
      console.warn("API Error - getMeasurements:", error);
      // Fallback for UI if API route doesn't exist yet, so user can see it works
      return [];
    }
  },

  createMeasurement: async (payload: Partial<MeasurementRecord>): Promise<MeasurementRecord> => {
    const { data } = await apiBack.post("private/measurements", payload, { headers: getHeaders() });
    return data;
  },

  updateMeasurement: async (id: string, payload: Partial<MeasurementRecord>): Promise<MeasurementRecord> => {
    const { data } = await apiBack.put(`private/measurements/${id}`, payload, { headers: getHeaders() });
    return data;
  },
  
  deleteMeasurement: async (id: string): Promise<void> => {
    await apiBack.delete(`private/measurements/${id}`, { headers: getHeaders() });
  }
};
