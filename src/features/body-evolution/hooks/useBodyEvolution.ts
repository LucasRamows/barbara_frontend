import { useEffect, useState } from "react";
import type { MeasurementRecord } from "../../../types/body-evolution";
import { bodyEvolutionService } from "../services/bodyEvolution.service";

export const useBodyEvolution = () => {
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await bodyEvolutionService.getMeasurements();
      setMeasurements(data);
    } catch (err) {
      console.error("Error loading body evolution data", err);
    } finally {
      setLoading(false);
    }
  };

  const addMeasurement = async (payload: Partial<MeasurementRecord>) => {
    try {
      const newMeasurement = await bodyEvolutionService.createMeasurement(payload);
      setMeasurements((prev) => [...prev, newMeasurement]);
    } catch (err) {
      console.error("Error adding measurement", err);
    }
  };

  const updateMeasurement = async (id: string, payload: Partial<MeasurementRecord>) => {
    try {
      const updated = await bodyEvolutionService.updateMeasurement(id, payload);
      setMeasurements((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (err) {
      console.error("Error updating measurement", err);
    }
  };

  const deleteMeasurement = async (id: string) => {
    try {
      await bodyEvolutionService.deleteMeasurement(id);
      setMeasurements((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Error deleting measurement", err);
    }
  };

  return {
    measurements,
    loading,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
    refreshData: loadData,
  };
};
